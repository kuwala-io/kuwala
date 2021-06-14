import logging
import os
import sys

sys.path.insert(0, '../../common/')
sys.path.insert(0, '../')

from dotenv import load_dotenv
from quart import Quart
from routes.search import search
from routes.poi_information import poi_information
from routes.popularity import popularity
from python_utils.src.error_handler import general_error
from utils.proxy import check_proxy_connection

app = Quart(__name__)
app.register_blueprint(search)
app.register_blueprint(poi_information)
app.register_blueprint(popularity)
app.register_error_handler(error=400, func=general_error)
app.register_error_handler(error=429, func=general_error)


if __name__ == '__main__':
    environment = sys.argv[1] if len(sys.argv) > 1 else 'local'
    load_dotenv(dotenv_path=f'../config/env/.env.{environment}')

    if not check_proxy_connection():
        logging.warning('Could not connect to proxy.')

    app.run(host='0.0.0.0',port=int(os.environ.get("API_PORT")))
