from search_scraper import scrape_with_search_string
from search_string_generator import generate_search_strings

if __name__ == '__main__':
    search_strings = generate_search_strings()

    scrape_with_search_string(search_strings)
