import sys

sys.path.insert(0, '../../../../common/')

from SearchScraper import SearchScraper
from search_string_generator import generate_search_strings

if __name__ == '__main__':
    generate_search_strings()
    SearchScraper.scrape_with_search_string()
