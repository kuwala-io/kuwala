from SearchScraper import SearchScraper
from search_string_generator import generate_search_strings

if __name__ == '__main__':
    search_strings = generate_search_strings()
    # Set to ten partitions so scraper is not overloaded
    # Each partition sends 100 search strings per request
    search_strings = search_strings.repartition(numPartitions=10)

    SearchScraper.scrape_with_search_string(search_strings)
