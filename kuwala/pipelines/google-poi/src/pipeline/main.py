import sys

sys.path.insert(0, '../../../../common/')
sys.path.insert(0, '../../')

from SearchScraper import SearchScraper
from search_string_generator import generate_search_strings

if __name__ == '__main__':
    generate_search_strings()
    SearchScraper.scrape_with_search_string()
