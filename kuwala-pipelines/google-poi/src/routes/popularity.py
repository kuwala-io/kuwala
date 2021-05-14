import math
import moment
import src.utils.google as google
from multiprocessing import Pool
from quart import abort, Blueprint, jsonify, request
from src.utils.array_utils import get_nested_value

popularity = Blueprint('popularity', __name__)


@popularity.route('/popularity', methods=['GET'])
async def get_popularities():
    """Retrieve current popularity for an array of ids"""
    ids = await request.get_json()

    if len(ids) > 100:
        abort(400, description='You can send at most 100 ids at once.')

    pool = Pool(processes=math.ceil(len(ids) / 3))
    results = list()

    def parse_result(r):
        p = get_nested_value(r['data'], 6, 84, 7, 1)
        time_zone = get_nested_value(r['data'], 31, 1, 0, 0)
        date_time = moment.utcnow().timezone(time_zone)

        return dict(
            id=r['id'],
            data=dict(
                popularity=p,
                dateTime=str(date_time)
            )
        )

    for result in pool.imap(google.get_by_id, ids):
        results.append(parse_result(result))

    return jsonify({'success': True, 'data': results})
