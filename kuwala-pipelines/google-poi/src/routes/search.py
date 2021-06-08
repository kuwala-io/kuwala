import h3
import src.utils.google as google
from config.h3.h3_config import POI_RESOLUTION
from quart import abort, Blueprint, request
from src.utils.array_utils import get_nested_value
from src.utils.futures import execute_futures

search = Blueprint('search', __name__)


@search.route('/search', methods=['GET'])
async def search_places():
    """Retrieve placeIDs for an array of query strings"""
    queries = await request.get_json()

    if len(queries) > 100:
        abort(400, description='You can send at most 100 queries at once.')

    def parse_result(r):
        data = r['data']

        if data:
            lat = get_nested_value(data, 9, 2)
            lng = get_nested_value(data, 9, 3)

            if lat and lng:
                lat = round(lat, 7)  # 7 digits equals a precision of 1 cm
                lng = round(lng, 7)  # 7 digits equals a precision of 1 cm
                # noinspection PyUnresolvedReferences
                h3_index = h3.geo_to_h3(lat, lng, POI_RESOLUTION)
                pb_id = get_nested_value(data, 10)
                name = get_nested_value(data, 11)

                return dict(
                    query=r['query'],
                    data=dict(
                        location=dict(lat=lat, lng=lng),
                        h3Index=h3_index,
                        id=pb_id,
                        name=name
                    )
                )

        return r

    return execute_futures(queries, google.search, parse_result)
