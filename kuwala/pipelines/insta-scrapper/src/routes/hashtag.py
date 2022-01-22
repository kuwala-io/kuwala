from quart import abort, Blueprint, request, jsonify
from instascrape import *
from utils import processor

hashtag = Blueprint('hashtag', __name__, url_prefix='/hashtag')

@hashtag.route('/', methods=['GET'])
async def get_hashtag_information():
    search_tags = await request.get_json()
    
    if search_tags is None:
        abort(400, description='Invalid request body, is the request body type a JSON?')

    if len(search_tags) > 100:
        abort(400, description='You can send at most 100 ids at once.')

    urls = list(map(convert_into_url_list, search_tags))

    result = processor.process_by_type(urls, 'hashtag')

    return jsonify(result)

def convert_into_url_list(hashtag):
    return f'https://www.instagram.com/explore/tags/{hashtag.lower()}/'