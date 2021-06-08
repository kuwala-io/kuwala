import pyspark.sql
import requests


def send_search_query(batch):
    result = requests.request(method='get', url='http://localhost:3003/search', json=batch)

    return result.json()


def batch_rows(partition):
    batch = list()
    batch_size = 100

    for row in partition:
        batch.append(row.searchString)

        if len(batch) == batch_size:
            result = send_search_query(batch)

            # TODO merge result with dataframe

            batch = list()

    if len(batch) > 0:
        send_search_query(batch)


def scrape_with_search_string(search_strings: pyspark.sql.DataFrame):
    # search_strings.foreachPartition(lambda p: batch_rows(p))
    batch_rows(search_strings.take(1000))
