
import logging
import sys
import os

from quart import Quart
from routes.hashtag import hashtag
from routes.posts import posts
from routes.profiles import profiles
from routes.locations import locations
from routes.reels import reels
from routes.igtv import igtv

from utils.proxy import check_proxy_connection

from dotenv import load_dotenv

logging.getLogger().setLevel(logging.INFO)

app = Quart(__name__)
app.register_blueprint(hashtag)
app.register_blueprint(posts)
app.register_blueprint(profiles)
app.register_blueprint(locations)
app.register_blueprint(reels)
app.register_blueprint(igtv)

@app.route('/')
async def hello():
    return 'Running Insta Scrapper API on 3016'

environment = sys.argv[1] if len(sys.argv) > 1 else 'local'
logging.info(f'Running on {environment} environment')

load_dotenv(dotenv_path=f'../config/env/.env.{environment}')

if not check_proxy_connection():
    logging.warning('Could not connect to proxy.')
    

app.run(host='0.0.0.0', port=3016)