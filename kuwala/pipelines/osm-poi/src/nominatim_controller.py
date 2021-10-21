import json
import logging
import os
import requests
from time import sleep


def get_geo_json_by_id(df_ids):
    for index, row in df_ids.iterrows():
        geo_json = get_geo_json(row.id)
        df_ids.at[index, 'geo_json'] = json.dumps(geo_json)

    return df_ids


def get_geo_json(relation_id):
    max_sleep_time = 120
    sleep_time = 1
    proxy = os.environ.get('PROXY_ADDRESS')
    proxies = dict(http=proxy, https=proxy)
    geo_json = None

    while not geo_json and (sleep_time < max_sleep_time):
        # noinspection PyBroadException
        try:
            result = requests.get(
                f'https://nominatim.openstreetmap.org/lookup?osm_ids=R{relation_id}&polygon_geojson=1&format=json',
                proxies=proxies
            )

            if result:
                result_json = result.json()

                if len(result_json) > 0 and 'geojson' in result_json[0]:
                    geo_json = result_json[0]['geojson']

                sleep_time = max_sleep_time
            else:
                sleep(sleep_time)
                sleep_time *= 2
        except Exception:
            sleep(sleep_time)
            sleep_time *= 2

    if not geo_json:
        logging.warning(f'Could not fetch GeoJSON for relation {relation_id}')

    return geo_json
