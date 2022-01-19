from quart import abort, Blueprint, request

hashtag = Blueprint('hashtag', __name__, url_prefix='/hashtag')

@hashtag.route('/', methods=['GET'])
async def get_hashtag_information():
    return 'HASHTAG'