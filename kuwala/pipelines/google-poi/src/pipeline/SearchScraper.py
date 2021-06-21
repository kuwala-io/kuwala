import h3
import json
import moment
import requests
from fuzzywuzzy import fuzz
from ListAccumulator import ListAccumulator
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, udf
from pyspark.sql.types import DoubleType, IntegerType
from typing import Callable

max_h3_distance = 500


class SearchScraper:
    """Get result for search strings"""
    @staticmethod
    def send_search_query(batch):
        result = requests.request(method='get', url='http://localhost:3003/search', json=batch)

        return result.json()

    """Get POI information by id"""
    @staticmethod
    def send_poi_query(batch):
        result = requests.request(method='get', url='http://localhost:3003/poi-information', json=batch)

        return result.json()

    """Get number of H3 cells in between to given cells of the same resolution"""
    @staticmethod
    @udf(returnType=IntegerType())
    def get_h3_distance(h1: str, h2: str):
        try:
            # noinspection PyUnresolvedReferences
            return h3.h3_distance(h1, h2)
        except h3.H3ValueError:
            return max_h3_distance

    """Get a similarity score for the Google name compared to the OSM name"""
    @staticmethod
    @udf(returnType=IntegerType())
    def get_name_distance(osm_name: str, query: str, google_name: str):
        return fuzz.token_set_ratio(osm_name, google_name) if osm_name else fuzz.token_set_ratio(query, google_name)

    """Calculate the confidence of a Google result based on the name and H3 distance"""
    @staticmethod
    @udf(returnType=DoubleType())
    def get_confidence(h3_distance: int, name_distance: int):
        def get_h3_confidence(d):
            if d <= 25:
                return 1

            return 1 - d / max_h3_distance if d < max_h3_distance else 0

        def get_name_confidence(d):
            return d / 100

        h3_confidence = get_h3_confidence(h3_distance)
        name_confidence = get_name_confidence(name_distance)

        return h3_confidence * (2 / 3) + name_confidence * (1 / 3)

    """Match the queries that have been sent to the received results"""
    @staticmethod
    def match_search_results(df_p: DataFrame, results: list) -> DataFrame:
        spark = SparkSession.builder.appName('google-poi').getOrCreate()
        df_r = spark.sparkContext.parallelize(results).map(lambda x: json.dumps(x))
        df_r = spark.read.option('multiLine', 'true').json(df_r)

        # noinspection PyTypeChecker
        return df_p \
            .alias('df_p') \
            .join(df_r, df_p.query == df_r.query, 'inner') \
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

    """Match the POI ids that have been sent to the received results"""
    @staticmethod
    def match_poi_results(df_p: DataFrame, results: list) -> DataFrame:
        spark = SparkSession.builder.appName('google-poi').getOrCreate()
        df_r = spark.sparkContext.parallelize(results).map(lambda x: json.dumps(x))
        df_r = spark.read.option('multiLine', 'true').json(df_r)

        # noinspection PyTypeChecker
        return df_p \
            .alias('df_p') \
            .join(df_r, df_p.id == df_r.id, 'inner') \
            .filter(col('data.h3Index').isNotNull()) \
            .select('osmId', 'type', 'confidence', col('df_p.id').alias('id'), 'data.*')

    """Send queries in batches for each partition of a dataframe"""
    @staticmethod
    def batch_queries(
            df: DataFrame,
            query_property: str,
            query_function: Callable,
            match_function: Callable
    ) -> DataFrame:
        def execute_queries(partition, q_property, q_function, accu):
            batch = list()
            batch_size = 100

            for row in partition:
                batch.append(row[q_property])

                if len(batch) == batch_size:
                    result = q_function(batch)
                    batch = list()

                    if 'data' in result:
                        accu.add(result['data'])

            if len(batch) > 0:
                result = q_function(batch)

                if 'data' in result:
                    accu.add(result['data'])

        spark = SparkSession.builder.appName('google-poi').getOrCreate()
        # An accumulator is necessary because when using parallelization only copies of passed objects would be updated
        accumulator = spark.sparkContext.accumulator([], ListAccumulator())

        df.foreachPartition(lambda p: execute_queries(p, query_property, query_function, accumulator))

        return match_function(df, accumulator.value)

    """Send search strings to get Google POI ids"""
    @staticmethod
    def send_search_queries(df: DataFrame) -> DataFrame:
        return SearchScraper.batch_queries(
            df,
            query_property='query',
            query_function=SearchScraper.send_search_query,
            match_function=SearchScraper.match_search_results
        )

    """Send Google POI ids to retrieve all POI information"""
    @staticmethod
    def send_poi_queries(df: DataFrame) -> DataFrame:
        return SearchScraper.batch_queries(
            df,
            query_property='id',
            query_function=SearchScraper.send_poi_query,
            match_function=SearchScraper.match_poi_results
        )

    """Write scraped POI information to a Parquet file"""
    @staticmethod
    def scrape_with_search_string(search_strings: DataFrame):
        search_results = SearchScraper.send_search_queries(search_strings)
        poi_results = SearchScraper.send_poi_queries(search_results)

        poi_results.write.parquet(f'../../../tmp/kuwala/googleFiles/google_pois_{moment.now()}.parquet')
