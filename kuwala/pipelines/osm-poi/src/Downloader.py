import json
import questionary
import requests

BASE_URL = 'https://download.geofabrik.de'
FILE_SUFFIX = '-latest.osm.pbf'


class Downloader:
    @staticmethod
    def pick_region(url: str) -> str:
        region_response = requests.get(url)

        return ''

    @staticmethod
    def pick_file():
        with open(f'../resources/continents.json') as f:
            continents = json.load(f)

            f.close()

            continent = questionary.select('Which continent are you interested in?', choices=continents).ask()
            country = Downloader.pick_region(f'{BASE_URL}/{continent}')

            return ''

    @staticmethod
    def start():
        download_url = Downloader.pick_file()
