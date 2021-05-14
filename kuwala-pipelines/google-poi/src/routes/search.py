import math
from multiprocessing import Pool
import src.utils.google as google
from quart import abort, Blueprint, jsonify, request
from src.utils.array_utils import get_nested_value

search = Blueprint('search', __name__)


@search.route('/search', methods=['GET'])
async def search_places():
    """Retrieve placeIDs for an array of query strings"""
    queries = await request.get_json()

    if len(queries) > 100:
        abort(400, description='You can send at most 100 queries at once.')

    pool = Pool(processes=math.ceil(len(queries) / 3))
    results = list()

    def parse_result(r):
        lat = get_nested_value(r['data'], 9, 2)
        lng = get_nested_value(r['data'], 9, 3)
        pb_id = get_nested_value(r['data'], 10)

        return dict(
            query=r['query'],
            data=dict(
                lat=round(lat, 7),  # 7 digits equals a precision of 1 cm
                lng=round(lng, 7),  # 7 digits equals a precision of 1 cm
                id=pb_id
            )
        )

    for result in pool.imap(google.search, queries):
        results.append(parse_result(result))

    return jsonify({'success': True, 'data': results})
