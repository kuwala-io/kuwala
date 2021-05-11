import math
from multiprocessing import Pool
from quart import abort, Blueprint, jsonify, request
from src.utils.array_utils import get_nested_value
from src.utils.google import query_google

place_id = Blueprint('place_id', __name__)


@place_id.route('/place-id', methods=['GET'])
async def get_place_id():
    """Retrieve Google placeIDs for an array of query strings"""
    queries = await request.get_json()

    if len(queries) > 100:
        abort(400, description='You can send at most 100 queries at once')

    pool = Pool(processes=math.ceil(len(queries) / 3))
    results = list()

    def parse_result(r):
        lat = get_nested_value(r['data'], 9, 2)
        lng = get_nested_value(r['data'], 9, 3)
        google_place_id = get_nested_value(r['data'], 78)

        return dict(
            query=r['query'],
            data=dict(
                lat=round(lat, 7),  # 7 digits equals a precision of 1 cm
                lng=round(lng, 7),  # 7 digits equals a precision of 1 cm
                placeID=google_place_id
            )
        )

    for result in pool.imap_unordered(query_google, queries):
        results.append(parse_result(result))

    return jsonify({"success": True, "data": results})
