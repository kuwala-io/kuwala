import logging
import os

import requests
from requests.exceptions import ConnectionError


def check_proxy_connection():
    """
    Check the connection to the proxy specified in the environment variables
    :return: True if successfully connected or False otherwise
    """

    try:
        proxy = os.environ.get("PROXY_ADDRESS")

        if not proxy:
            logging.warning(
                "No proxy address is specified. Running requests without proxy."
            )

            return False

        proxies = dict(http=proxy, https=proxy)
        r = requests.get("https://api.ipify.org?format=json", proxies=proxies)

        if not r.ok:
            return False
        else:
            logging.info("Successfully connected to proxy.")

            return True
    except ConnectionError:
        return False
