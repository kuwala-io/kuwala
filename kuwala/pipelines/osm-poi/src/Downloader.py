import json
import os
import urllib.error
import questionary
from pyquery import PyQuery
from python_utils.src.FileDownloader import download_file


BASE_URL = 'https://download.geofabrik.de'
FILE_SUFFIX = '-latest.osm.pbf'


class Downloader:
    @staticmethod
    def pick_region(url: str):
        try:
            d = PyQuery(url=url)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return dict(url=f'{url}{FILE_SUFFIX}', all=True)

        regions = d.find(f"a[href$='{FILE_SUFFIX}']")
        regions = list(map(lambda rf: rf.text.split(FILE_SUFFIX)[0], filter(lambda r: r.text, regions)))

        regions.insert(0, 'all')

        selected_region = questionary.select('Which region are you interested in?', choices=regions).ask()

        if selected_region == 'all':
            return dict(url=f'{url}{FILE_SUFFIX}', all=True)

        return dict(url=f'{url}/{selected_region}', all=False)

    @staticmethod
    def pick_file():
        with open(f'../resources/continents.json') as f:
            continents = json.load(f)

            f.close()

            continent = questionary.select('Which continent are you interested in?', choices=continents).ask()
            country = Downloader.pick_region(f'{BASE_URL}/{continent}')

            if country:
                if country['all']:
                    return country['url']

                region = Downloader.pick_region(country['url'])

                if region:
                    return region['url'] if region['all'] else region['url'] + FILE_SUFFIX

            return None

    @staticmethod
    def start():
        download_url = Downloader.pick_file()
        script_dir = os.path.dirname(__file__)
        file_path = os.path.join(script_dir, f'../tmp/osmFiles/pbf{download_url.split(BASE_URL)[1]}')

        download_file(url=download_url, path=file_path)
