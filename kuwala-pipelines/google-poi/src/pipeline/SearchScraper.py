import h3
import requests
from fuzzywuzzy import fuzz
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, udf
from pyspark.sql.types import DoubleType, IntegerType


class SearchScraper:
    matched_results: list[DataFrame] = list()

    @staticmethod
    def send_search_query(batch):
        result = requests.request(method='get', url='http://localhost:3003/search', json=batch)

        return result.json()

    @staticmethod
    @udf(returnType=IntegerType())
    def get_h3_distance(h1, h2):
        # noinspection PyUnresolvedReferences
        return h3.h3_distance(h1, h2)

    @staticmethod
    @udf(returnType=IntegerType())
    def get_name_distance(osm_name, query, google_name):
        return fuzz.token_set_ratio(osm_name, google_name) if osm_name else fuzz.token_set_ratio(query, google_name)

    @staticmethod
    @udf(returnType=DoubleType())
    def get_confidence(h3_distance, name_distance):
        def get_h3_confidence(d):
            if d <= 25:
                return 1

            return 1 - d / 500 if d < 1000 else 0

        def get_name_confidence(d):
            return d / 100

        h3_confidence = get_h3_confidence(h3_distance)
        name_confidence = get_name_confidence(name_distance)

        return h3_confidence * (2 / 3) + name_confidence * (1 / 3)

    @staticmethod
    def match_results(partition, results):
        spark = SparkSession.builder.appName('google-poi').getOrCreate()
        df_p = spark.createDataFrame(data=partition, schema=['osmId', 'type', 'h3Index', 'name', 'query']).alias('df_p')
        df_r = spark.createDataFrame(data=results, schema=['data, query'])
        # noinspection PyTypeChecker
        return df_p \
            .join(df_r, df_p.query == df_r.query, 'inner') \
            .withColumn('data', col('data, query')) \
            .filter(col('data.h3Index').isNotNull()) \
            .withColumn('osmName', col('df_p.name')) \
            .withColumn('googleName', col('data.name')) \
            .withColumn(
                'nameDistance',
                SearchScraper.get_name_distance(col('osmName'), col('df_p.query'), col('googleName'))
            ) \
            .withColumn('h3Distance', SearchScraper.get_h3_distance(col('h3Index'), col('data.h3Index'))) \
            .withColumn('confidence', SearchScraper.get_confidence(col('h3Distance'), col('nameDistance'))) \
            .select('osmId', 'type', 'confidence', 'data.id')

    @staticmethod
    def batch_queries(partition, query_function, match_function, result_buffer):
        batch = list()
        results = list()
        batch_size = 10

        for row in partition:
            batch.append(row.query)

            if len(batch) == batch_size:
                result = query_function(batch)
                batch = list()

                if 'data' in result:
                    results.extend(result['data'])

        if len(batch) > 0:
            result = query_function(batch)

            if 'data' in result:
                results.extend(result['data'])

        matched_results = match_function(partition, results)

        result_buffer.append(matched_results)

    def send_search_queries(self, partition):
        SearchScraper.batch_queries(
            partition,
            query_function=SearchScraper.send_search_query,
            match_function=SearchScraper.match_results,
            result_buffer=self.matched_results
        )

    def scrape_with_search_string(self, search_strings: DataFrame):
        # TODO: Enable for production
        #  search_strings.foreachPartition(lambda p: send_search_queries(p))
        self.send_search_queries(search_strings.take(20))

        df_results = self.matched_results[0]

        for i in range(1, len(self.matched_results)):
            df_results = df_results.union(self.matched_results[i])

        df_results.show(truncate=False)
