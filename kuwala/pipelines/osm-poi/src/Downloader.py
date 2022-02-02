import os

from python_utils.src.FileDownloader import download_file
from python_utils.src.FileSelector import select_osm_file


class Downloader:
    @staticmethod
    def start(args):
        file = None

        if args.url is None:
            file = select_osm_file()

        script_dir = os.path.dirname(__file__)
        file_path = os.path.join(
            script_dir,
            f'../../../tmp/kuwala/osm_files/{args.continent or file["continent"]}',
        )

        if args.country or (file and file["country"]):
            file_path += f'/{args.country or file["country"]}'

        if args.country_region or (file and file["country_region"]):
            file_path += f'/{args.country_region or file["country_region"]}'

        file_path += "/pbf/geo_fabrik.osm.pbf"

        download_file(url=args.url or file["url"], path=file_path)
