import os
import sys

sys.path.insert(0, '../../common/')
sys.path.insert(0, '../')

from python_utils.src.FileDownloader import download_file
from python_utils.src.FileSelector import select_osm_file


class Downloader:
    @staticmethod
    def start():
        file = select_osm_file()
        script_dir = os.path.dirname(__file__)
        file_path = os.path.join(script_dir, f'../tmp/osmFiles/pbf/{file["continent"]}')

        if file['country']:
            file_path += f'/{file["country"]}'

        if file['country_region']:
            file_path += f'/{file["country_region"]}'

        file_path += '.osm.pbf'

        download_file(url=file['url'], path=file_path)
