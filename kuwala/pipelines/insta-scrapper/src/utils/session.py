import requests
import os
import logging
from utils.proxy import check_proxy_connection

def create_proxy_session():
    proxy = os.environ.get('PROXY_ADDRESS')
    proxies = dict(http=proxy, https=proxy)
    r = requests.session()

    if not proxy or not check_proxy_connection:
        logging.warning("Failed to load proxy")
        return r
    
    r.proxies.update(proxies)
    return r