from quart import abort, Blueprint, request, jsonify
from instascrape import *
from utils import processor

profiles = Blueprint('profiles', __name__, url_prefix='/profiles')

@profiles.route('/', methods=['GET'])
async def get_posts_information():
    search_queries = await request.get_json()
    
    if search_queries is None:
        abort(400, description='Invalid request body, is the request body type a JSON?')

    if len(search_queries) > 100:
        abort(400, description='You can send at most 100 ids at once.')

    urls = list(map(convert_into_url_list, search_queries))
    result = processor.process_by_type(urls, 'profiles')

    return jsonify(result)

def convert_into_url_list(username):
    return f'https://www.instagram.com/{username}/'