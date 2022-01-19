from quart import abort, Blueprint, request, jsonify
from instascrape import *
from utils import processor

profiles = Blueprint('profiles', __name__, url_prefix='/profiles')

@profiles.route('/', methods=['GET'])
async def get_posts_information():
    urls = await request.get_json()
    
    if urls is None:
        abort(400, description='Invalid request body, is the request body type a JSON?')

    if len(urls) > 100:
        abort(400, description='You can send at most 100 ids at once.')

    result = processor.process_by_type(urls, 'profiles')

    return jsonify(result)