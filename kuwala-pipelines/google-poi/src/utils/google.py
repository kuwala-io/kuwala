import json
import os
import requests
from src.utils.array_utils import get_nested_value


def query_google(query):
    """
    Get the data from Google Maps for a given query string
    :param str query: String that is used for the search (usually name + address)
    :return: The query string with its corresponding result
    """

    proxy = os.environ.get('PROXY_ADDRESS')
    proxies = dict(http=proxy, https=proxy)
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
              "!3b1"
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/54.0.2840.98 Safari/537.36"
    }
    search_url = "https://www.google.de/search"
    resp = requests.get(search_url, params=params, proxies=proxies if proxy else None, headers=headers)
    data = resp.text.split('/*""*/')[0]
    jend = data.rfind("}")

    if jend >= 0:
        data = data[:jend + 1]

    jdata = json.loads(data)["d"]
    jdata = json.loads(jdata[4:])

    # Get info from result array, has to be adapted if api changes
    data = get_nested_value(jdata, 0, 1, 0, 14)

    # Check second result
    if data is None:
        data = get_nested_value(jdata, 0, 1, 1, 14)

    return dict(query=query, data=data)
