import argparse
import logging
import sys

sys.path.insert(0, '../../../../common/')

from SearchScraper import SearchScraper
from search_string_generator import generate_search_strings

if __name__ == '__main__':
    logging.basicConfig(
        format='%(levelname)s %(asctime)s: %(message)s',
        level=logging.INFO,
        datefmt='%m/%d/%Y %I:%M:%S %p'
    )

    parser = argparse.ArgumentParser()

    parser.add_argument('--continent', help='Continent of the file')
    parser.add_argument('--country', help='Country of the file')
    parser.add_argument('--country_region', help='Country region of the file')
    parser.add_argument('--polygon_coords', help='Specify the region that should be scraped')
    parser.add_argument('--polygon_resolution', help='Specify the resolution for the polygon')

    args = parser.parse_args()
    continent = args.continent
    country = args.country
    country_region = args.country_region
    polygon_coords = args.polygon_coords
    polygon_resolution = args.polygon_resolution

    if not (continent and country):
        logging.error('No continent and/or country specified.')

        sys.exit(1)

    generate_search_strings(continent=continent, country=country, country_region=country_region,
                            polygon_coords=polygon_coords, polygon_resolution=polygon_resolution)
    SearchScraper.scrape_with_search_string(continent=continent, country=country, country_region=country_region)
