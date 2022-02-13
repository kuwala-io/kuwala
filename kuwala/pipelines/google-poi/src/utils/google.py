import json
import os
from time import sleep

from quart import abort
import requests
from requests.exceptions import ConnectionError
from src.utils.array_utils import get_nested_value

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/54.0.2840.98 Safari/537.36"
}


def fetch_data(url, params):
    proxy = os.environ.get("PROXY_ADDRESS")
    proxies = dict(http=proxy, https=proxy)
    sleep_time = 1

    while True:
        try:
            response = requests.get(
                url, params=params, proxies=proxies if proxy else None, headers=headers
            )

            if response.ok:
                break
            elif sleep_time < 60:
                sleep(sleep_time)
                sleep_time *= 2
            else:
                abort(429, "Too many request. Please check the proxy on the server")
        except ConnectionError:
            if sleep_time < 60:
                sleep(sleep_time)
                sleep_time *= 2
            else:
                abort(429, "Too many request. Please check the proxy on the server")

    return response


def search(query):
    """
    Get the data for a given query string
    :param str query: String that is used for the search (name + address or place_id:{place_ide})
    :return: The query string with its corresponding result
    """

    url = "https://www.google.de/search"
    params = {
        "tbm": "map",
        "tch": 1,
        "hl": "en",
        "q": query,
        "pb": "!4m12!1m3!1d4005.9771522653964!2d-122.42072974863942!3d37.8077459796541!2m3!1f0!2f0!3f0!3m2!1i1125!2i976"
        "!4f13.1!7i20!10b1!12m6!2m3!5m1!6e2!20e3!10b1!16b1!19m3!2m2!1i392!2i106!20m61!2m2!1i203!2i100!3m2!2i4!5b1"
        "!6m6!1m2!1i86!2i86!1m2!1i408!2i200!7m46!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e3!2b0!3e3!"
        "1m3!1e4!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e3!2b1!3e2!1m3!1e9!2b1!3e2!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e"
        "10!2b0!3e4!2b1!4b1!9b0!22m6!1sa9fVWea_MsX8adX8j8AE%3A1!2zMWk6Mix0OjExODg3LGU6MSxwOmE5ZlZXZWFfTXNYOGFkWDh"
        "qOEFFOjE!7e81!12e3!17sa9fVWea_MsX8adX8j8AE%3A564!18e15!24m15!2b1!5m4!2b1!3b1!5b1!6b1!10m1!8e3!17b1!24b1!"
        "25b1!26b1!30m1!2b1!36b1!26m3!2m2!1i80!2i92!30m28!1m6!1m2!1i0!2i0!2m2!1i458!2i976!1m6!1m2!1i1075!2i0!2m2!"
        "1i1125!2i976!1m6!1m2!1i0!2i0!2m2!1i1125!2i20!1m6!1m2!1i0!2i956!2m2!1i1125!2i976!37m1!1e81!42b1!47m0!49m1"
        "!3b1",
    }
    response = fetch_data(url, params)
    data = response.text.split('/*""*/')[0]
    jend = data.rfind("}")

    if jend >= 0:
        data = data[: jend + 1]

    jdata = json.loads(data)["d"]
    jdata = json.loads(jdata[4:])

    # Get info from result array, has to be adapted if api changes
    data = get_nested_value(jdata, 0, 1, 0, 14)

    # Check second result
    if data is None:
        data = get_nested_value(jdata, 0, 1, 1, 14)

    return dict(query=query, data=data)


def get_by_id(pb_id):
    """
    Get the data for a given id
    :param str pb_id: Id that is used to retrieve a specific place over the pb query parameter
    :return: The id with its corresponding result
    """

    url = "https://www.google.com/maps/preview/place"
    params = {
        "authuser": 0,
        "hl": "en",
        "gl": "en",
        "pb": f"!1m17!1s{pb_id}!3m12!1m3!1d4005.9771522653964!2d-122.42072974863942!3d37.8077459796541!2m3!1f0!2f0"
        "!3f0!3m2!1i1440!2i414!4f13.1!4m2!3d-122.42072974863942!4d37.8077459796541!12m4!2m3!1i360!2i120!4i8"
        "!13m65!2m2!1i203!2i100!3m2!2i4!5b1!6m6!1m2!1i86!2i86!1m2!1i408!2i240!7m50!1m3!1e1!2b0!3e3!1m3!1e2!2b1"
        "!3e2!1m3!1e2!2b0!3e3!1m3!1e3!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e3!2b1!3e2!1m3!1e10!2b0!3e3!1m3!1e10!2b1"
        "!3e2!1m3!1e9!2b1!3e2!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e4!2b1!4b1!9b0!14m5"
        "!1sTpKbYLDlD47FUrPBo4gL!4m1!2i5210!7e81!12e3!15m55!1m17!4e2!13m7!2b1!3b1!4b1!6i1!8b1!9b1!20b1!18m7"
        "!3b1!4b1!5b1!6b1!9b1!13b1!14b0!2b1!5m5!2b1!3b1!5b1!6b1!7b1!10m1!8e3!14m1!3b1!17b1!20m2!1e3!1e6!24b1"
        "!25b1!26b1!29b1!30m1!2b1!36b1!43b1!52b1!54m1!1b1!55b1!56m2!1b1!3b1!65m5!3m4!1m3!1m2!1i224!2i298!89b1"
        "!21m28!1m6!1m2!1i0!2i0!2m2!1i458!2i414!1m6!1m2!1i1390!2i0!2m2!1i1440!2i414!1m6!1m2!1i0!2i0!2m2!1i1440"
        "!2i20!1m6!1m2!1i0!2i394!2m2!1i1440!2i414!22m1!1e81!29m0!30m1!3b1!34m2!7b1!10b1!37i557",
    }
    response = fetch_data(url, params)
    data = response.text.split("'\n")[1]
    data = json.loads(data)

    return dict(id=pb_id, data=data)
