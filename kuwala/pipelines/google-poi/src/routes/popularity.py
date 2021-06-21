import moment
import src.utils.google as google
from quart import abort, Blueprint, request
from src.utils.array_utils import get_nested_value
from src.utils.futures import execute_futures

popularity = Blueprint('popularity', __name__)


@popularity.route('/popularity', methods=['GET'])
async def get_popularities():
    """Retrieve current popularity for an array of ids"""
    ids = await request.get_json()

    if len(ids) > 100:
        abort(400, description='You can send at most 100 ids at once.')

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

    return execute_futures(ids, google.get_by_id, parse_result)
