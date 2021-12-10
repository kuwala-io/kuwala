import h3
import moment
import re
import src.utils.google as google
from config.h3.h3_config import POI_RESOLUTION
from quart import abort, Blueprint, request
from src.utils.array_utils import get_nested_value
from src.utils.futures import execute_futures

from src.utils.cat_mapping import complete_categories

poi_information = Blueprint('poi-information', __name__)


def parse_opening_hours(opening_hours):
    """Parse opening hours to timestamps"""
    if not opening_hours:
        return None

    def parse_list(li):
        date = get_nested_value(li, 4)
        opening_time_hours = get_nested_value(li, 6, 0, 0)
        opening_time_minutes = get_nested_value(li, 6, 0, 1)
        closing_time_hours = get_nested_value(li, 6, 0, 2)
        closing_time_minutes = get_nested_value(li, 6, 0, 3)

        # TODO: Consider places with breaks (e.g., closed between 13-14h)

        return dict(
            date=str(moment.date(date)),
            openingTime=str(moment.date(date).add(
                hours=opening_time_hours,
                minutes=opening_time_minutes
            )) if opening_time_hours is not None else None,
            closingTime=str(moment.date(date).add(
                days=1 if  # Necessary if closing at midnight or later or when place is open 24 hours (all values 0)
                closing_time_hours < opening_time_hours | (
                        opening_time_hours == 0 &
                        opening_time_minutes == 0 &
                        closing_time_hours == 0 &
                        closing_time_minutes == 0
                ) else 0,
                hours=closing_time_hours,
                minutes=closing_time_minutes
            )) if closing_time_hours is not None else None
        )

    return list(map(parse_list, opening_hours))


def parse_waiting_time_data(waiting_time_data):
    """Parse waiting time string to minutes"""
    numbers = re.findall(r'\d+', waiting_time_data)

    if len(numbers) == 0:
        waiting_time = 0
    elif "min" in waiting_time_data:
        waiting_time = int(numbers[0])
    elif "hour" in waiting_time_data:
        waiting_time = int(numbers[0]) * 60
    else:
        waiting_time = int(numbers[0]) * 60 + int(numbers[1])

    return waiting_time


def parse_popularity_data(popularity_data, timezone):
    """Parse popularity information to timestamps in the respective timezone"""
    popularity, waiting_time = [], []
    includes_waiting_time = False

    for day in popularity_data:
        weekday = day[0]
        p = []
        w = []

        # Create timestamps for each hour of the week and set popularity and waiting time to 0 by default since the
        # returned popularity array doesn't necessarily cover all 24 hours of a day but only relevant hours
        for h in range(24):
            timestamp = str(moment.utcnow().timezone(timezone).replace(
                weekday=weekday,
                hours=h,
                minutes=0,
                seconds=0
            ))

            p.append(dict(timestamp=timestamp, popularity=0))
            w.append(dict(timestamp=timestamp, waitingTime=0))

        if day[1] is not None:
            for p_info in day[1]:
                timestamp = str(moment.utcnow().timezone(timezone).replace(
                    weekday=weekday,
                    hours=p_info[0],
                    minutes=0,
                    seconds=0
                ))
                index = next((i for i, item in enumerate(p) if item['timestamp'] == timestamp), -1)
                p[index]['popularity'] = p_info[1]

                # check if the waiting string is available and convert to minutes
                if len(p_info) > 5:
                    includes_waiting_time = True
                    w[index]['waitingTime'] = parse_waiting_time_data(p_info[3])

        popularity += p
        waiting_time += w

    return \
        sorted(popularity, key=lambda x: x['timestamp']), \
        sorted(waiting_time, key=lambda x: x['timestamp']) if includes_waiting_time else None


def parse_spending_time_data(spending_time_data):
    if not spending_time_data:
        return None

    # Example: 'People typically spend up to 25 min here'
    numbers = [float(f) for f in re.findall(r'\d*\.\d+|\d+', spending_time_data.replace(',', '.'))]
    contains_min = 'min' in spending_time_data
    contains_hour = 'hour' in spending_time_data or 'hr' in spending_time_data
    spending_time = None

    if contains_min and contains_hour:
        spending_time = [numbers[0], numbers[1] * 60]
    elif contains_hour:
        spending_time = [numbers[0] * 60, (numbers[0] if len(numbers) == 1 else numbers[1]) * 60]
    elif contains_min:
        spending_time = [numbers[0], numbers[0] if len(numbers) == 1 else numbers[1]]

    return [int(t) for t in spending_time]


@poi_information.route('/poi-information', methods=['GET'])
async def get_poi_information():
    """Retrieve POI information for an array of ids"""
    ids = await request.get_json()
    
    if ids is None:
        abort(415, description='Invalid request body, is the request body type a JSON?')

    if len(ids) > 100:
        abort(400, description='You can send at most 100 ids at once.')

    def parse_result(r):
        data = r['data'][6]
        name = get_nested_value(data, 11)
        place_id = get_nested_value(data, 78)
        lat = get_nested_value(data, 9, 2)
        lng = get_nested_value(data, 9, 3)

        if lat and lng:
            lat = round(lat, 7)  # 7 digits equals a precision of 1 cm
            lng = round(lng, 7)  # 7 digits equals a precision of 1 cm

        # noinspection PyUnresolvedReferences
        h3_index = h3.geo_to_h3(lat, lng, POI_RESOLUTION) if lat and lng else None
        address = get_nested_value(data, 2)
        timezone = get_nested_value(data, 30)
        categories = [t[0] for t in (get_nested_value(data, 76) or [])]
        opening_hours = parse_opening_hours(get_nested_value(data, 34, 1))
        permanently_closed = get_nested_value(data, 88, 0) == 'CLOSED'
        temporarily_closed = get_nested_value(data, 96, 5, 0, 2) == 'Reopen this place' and not permanently_closed
        inside_of = get_nested_value(data, 93, 0, 0, 0, 1)
        phone = get_nested_value(data, 178, 0, 3)
        website = get_nested_value(data, 7, 0)
        rating_stars = get_nested_value(data, 4, 7)
        rating_number_of_reviews = get_nested_value(data, 4, 8)
        price_level = get_nested_value(data, 4, 2)
        popularity_data = get_nested_value(data, 84, 0)
        spending_time = parse_spending_time_data(get_nested_value(data, 117, 0))
        popularity, waiting_time = None, None

        if popularity_data:
            popularity, waiting_time = parse_popularity_data(popularity_data, timezone)

        return dict(
            id=r['id'],
            data=dict(
                name=name,
                placeID=place_id,
                location=dict(lat=lat, lng=lng),
                h3Index=h3_index,
                address=address,
                timezone=timezone,
                categories=complete_categories(categories),
                temporarilyClosed=temporarily_closed,
                permanentlyClosed=permanently_closed,
                insideOf=inside_of,
                contact=dict(phone=phone, website=website),
                openingHours=opening_hours,
                rating=dict(stars=rating_stars, numberOfReviews=rating_number_of_reviews),
                priceLevel=len(price_level) if price_level else None,
                popularity=popularity,
                waitingTime=waiting_time,
                spendingTime=spending_time
            )
        )

    return execute_futures(ids, google.get_by_id, parse_result)
