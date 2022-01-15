import argparse
import logging
import questionary
import sys

sys.path.insert(0, '../../../common/')

from Downloader import Downloader
from Processor import Processor

if __name__ == '__main__':
    logging.basicConfig(
        format='%(levelname)s %(asctime)s: %(message)s',
        level=logging.INFO,
        datefmt='%m/%d/%Y %I:%M:%S %p'
    )

    parser = argparse.ArgumentParser()

    parser.add_argument('--action', help='Download or process file')
    parser.add_argument('--continent', help='Continent of the file')
    parser.add_argument('--country', help='Country of the file')
    parser.add_argument('--country_region', help='Country region of the file')
    parser.add_argument('--url', help='URL to download file from Geofabrik server')

    args = parser.parse_args()
    choices = ['download', 'process']

    if args.action is not None and args.action in choices:
        action = args.action
    else:
        option = questionary.select('What do you want to do?', choices=choices).ask()
        action = 'download' if option == choices[0] else 'process'

    if action == 'download':
        Downloader.download_pbf(args)
        Downloader.download_names()
    else:
        Processor.start(args)
