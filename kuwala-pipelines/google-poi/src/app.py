import logging
import os
import sys
from dotenv import load_dotenv
from quart import Quart
from routes.place_id import place_id
from utils.proxy import check_proxy_connection
from shared.python.src.error_handler import bad_request

app = Quart(__name__)
app.register_blueprint(place_id)
app.register_error_handler(error=400, func=bad_request)


if __name__ == '__main__':
    environment = sys.argv[1] if len(sys.argv) > 1 else 'local'
    load_dotenv(dotenv_path=f'../config/env/.env.{environment}')

    if not check_proxy_connection():
        logging.warning('Could not connect to proxy.')

    app.run(port=int(os.environ.get("API_PORT")))
