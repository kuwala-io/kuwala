from SearchScraper import SearchScraper
from search_string_generator import generate_search_strings

if __name__ == '__main__':
    search_strings = generate_search_strings()

    SearchScraper.scrape_with_search_string(search_strings)
