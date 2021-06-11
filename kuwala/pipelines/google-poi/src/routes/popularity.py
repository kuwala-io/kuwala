import math
import moment
import src.utils.google as google
import asyncio
from quart import abort, Blueprint, jsonify, request
from src.utils.array_utils import get_nested_value

popularity = Blueprint('popularity', __name__)


@popularity.route('/popularity', methods=['GET'])
async def get_popularities():
    """Retrieve current popularity for an array of ids"""
    ids = await request.get_json()

    if len(ids) > 100:
        abort(400, description='You can send at most 100 ids at once.')

    loop = asyncio.get_event_loop()

    def parse_result(r):
        data = r['data']
        p = get_nested_value(data, 6, 84, 7, 1)
        time_zone = get_nested_value(data, 31, 1, 0, 0)
        timestamp = moment.utcnow().timezone(time_zone).replace(minutes=0, seconds=0)

        return dict(
            id=r['id'],
            data=dict(
                popularity=p,
                timestamp=str(timestamp)
            )
        )

    futures = []
    for id in ids:
        futures.append(loop.run_in_executor(None, google.get_by_id, id))

    results = loop.run_until_complete(asyncio.gather(*futures))
    
    parsed = []
    for result in results:
        parsed.append(parse_result(result))

    return jsonify({'success': True, 'data': parsed})
