import logging
import os
import pandas
import pyarrow as pa
import pyarrow.parquet as pq
import requests
from func_timeout import func_set_timeout, FunctionTimedOut
from pandas import DataFrame
from pathlib import Path
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit
from pyspark.sql.types import StringType
from python_utils.src.spark_udfs import \
    get_confidence_based_h3_and_name_distance, get_h3_distance, get_h3_index, get_string_distance
from time import sleep

MAX_H3_DISTANCE = 500


class SearchScraper:
    """Get result for search strings"""
    @staticmethod
    @func_set_timeout(180)
    def send_query(batch, query_type):
        # noinspection PyBroadException
        try:
            host = os.getenv('GOOGLE_POI_API_HOST') or '127.0.0.1'
            # noinspection HttpUrlsUsage
            result = requests.request(
                method='get',
                url=f'http://{host}:3003/{"search" if query_type == "search" else "poi-information"}',
                json=batch)

            return result.json() if result else None
        except Exception as e:
            logging.error('Search query failed: ', e)
            logging.error('Continuing without batch.')

            return None

    """Match the queries that have been sent to the received results"""
    @staticmethod
    def match_search_results(directory, file_name, search_string_basis):
        memory = os.getenv('SPARK_MEMORY') or '16g'
        spark = SparkSession.builder.appName('google-poi').config('spark.driver.memory', memory).getOrCreate()

        if search_string_basis == 'osm':
            df_str = spark.read.parquet(directory + file_name)
        else:
            df_str = spark.read.option('header', 'true').csv(directory + file_name.replace('parquet', 'csv'))

        path_results = directory.replace('strings', 'results') + file_name.replace('strings', 'results')
        df_res = spark.read.parquet(path_results)
        # noinspection PyTypeChecker
        df_res = df_str \
            .alias('df_str') \
            .join(df_res, on='query', how='left') \
            .filter(col('data.h3_index').isNotNull()) \
            .withColumn('google_name', col('data.name'))

        if search_string_basis == 'osm':
            df_res = df_res \
                .withColumn('osm_name', col('df_str.name')) \
                .withColumn(
                    'name_distance',
                    get_string_distance(col('google_name'), col('osm_name'), col('df_str.query'))
                ) \
                .withColumn(
                    'h3_distance',
                    get_h3_distance(col('h3_index').cast(StringType()), col('data.h3_index').cast(StringType()),
                                    lit(MAX_H3_DISTANCE))
                ) \
                .withColumn(
                    'confidence',
                    get_confidence_based_h3_and_name_distance(col('h3_distance'), col('name_distance'),
                                                              lit(MAX_H3_DISTANCE))
                ) \
                .select('osm_type', 'osm_id', col('data.id').alias('internal_id'), 'confidence', 'name_distance',
                        'h3_distance', 'query')
        else:
            df_res = df_res \
                .withColumn('h3_index', get_h3_index(col('latitude'), col('longitude'), lit(15))) \
                .withColumn('name_distance',
                            get_string_distance(col('google_name'), col('name'), col('df_str.query'))) \
                .withColumn('h3_distance',
                            get_h3_distance(col('h3_index').cast(StringType()), col('data.h3_index').cast(StringType()),
                                            lit(MAX_H3_DISTANCE))) \
                .withColumn(
                    'confidence',
                    get_confidence_based_h3_and_name_distance(col('h3_distance'), col('name_distance'),
                                                              lit(MAX_H3_DISTANCE))
                ) \
                .select('id', col('data.id').alias('internal_id'), 'confidence', 'name_distance', 'h3_distance',
                        'query')

        df_res.write.mode('overwrite').parquet(path_results.replace('_search_results', '_search_results_matched'))

    """Match the POI ids that have been sent to the received results"""

    @staticmethod
    def match_poi_results(directory: str, file_name: str, search_string_basis):
        memory = os.getenv('SPARK_MEMORY') or '16g'
        spark = SparkSession.builder.appName('google-poi').config('spark.driver.memory', memory).getOrCreate()
        df_res = spark.read.parquet(
            directory.replace('strings', 'results') + file_name.replace('strings', 'results_matched')
        )
        path_poi_data = \
            directory.replace('search_strings', 'poi_data') + file_name.replace('search_strings', 'poi_data')
        df_pd = spark.read.parquet(path_poi_data).withColumnRenamed('id', 'internal_id')

        # noinspection PyTypeChecker
        df_pd = df_res \
            .alias('df_res') \
            .join(df_pd, on='internal_id', how='left') \
            .filter(col('data.h3_index').isNotNull())

        if search_string_basis == 'osm':
            df_pd = df_pd.select('osm_id', 'osm_type', 'confidence', 'internal_id', 'data.*')
        else:
            df_pd = df_pd.select('id', 'confidence', 'internal_id', 'data.*')

        df_pd = df_pd \
            .withColumn('latitude', col('location.lat')) \
            .withColumn('longitude', col('location.lng')) \
            .drop('location') \
            .withColumn('tags', col('categories.google')) \
            .withColumn('categories', col('categories.kuwala')) \
            .withColumn('contact_phone', col('contact.phone')) \
            .withColumn('contact_website', col('contact.website')) \
            .drop('contact') \
            .withColumn('number_of_reviews', col('rating.number_of_reviews')) \
            .withColumn('rating_stars', col('rating.stars')) \
            .drop('rating') \
            .withColumn('spending_time_min', col('spending_time').getItem(0)) \
            .withColumn('spending_time_max', col('spending_time').getItem(1)) \
            .drop('spending_time')

        df_pd.write.mode('overwrite').parquet(path_poi_data.replace('_poi_data', '_poi_data_matched'))

    """Send queries in batches for each partition of a dataframe"""

    @staticmethod
    def batch_queries(
            df: DataFrame,
            output_dir: str,
            file_name: str,
            query_property: str,
            query_type: str,
            schema=None
    ):
        batch = list()
        batch_size = 100
        max_sleep_time = 120
        writer = None

        for index, row in df.iterrows():
            batch.append(row[query_property])

            # noinspection PyTypeChecker
            if (len(batch) == batch_size) or ((index + 1) == len(df.index)):
                successful = False
                sleep_time = 1

                while not successful and (sleep_time < max_sleep_time):
                    try:
                        result = SearchScraper.send_query(batch, query_type)

                        if result and ('data' in result):
                            data = pandas.DataFrame(result['data'])
                            # noinspection PyArgumentList
                            table = pa.Table.from_pandas(df=data, schema=schema)

                            if not writer:
                                script_dir = os.path.dirname(__file__)
                                output_dir = os.path.join(script_dir, output_dir)
                                output_file = os.path.join(output_dir, file_name)

                                Path(output_dir).mkdir(parents=True, exist_ok=True)

                                writer = pq.ParquetWriter(
                                    output_file,
                                    schema=schema if schema else table.schema,
                                    flavor='spark'
                                )

                            writer.write_table(table)

                            successful = True
                        else:
                            sleep(sleep_time)
                            sleep_time *= 2
                    except FunctionTimedOut:
                        sleep(sleep_time)
                        sleep_time *= 2

                        if sleep_time >= max_sleep_time:
                            logging.error('Request timed out too many times. Skipping batch')

                batch = list()

        if writer:
            writer.close()

    """Send Google POI ids to retrieve all POI information"""
    @staticmethod
    def send_poi_queries(directory, file_name, continent, country, country_region):
        pois = pq \
            .read_table(directory.replace('strings', 'results') + file_name.replace('strings', 'results_matched')) \
            .to_pandas()
        pois = pois[['internal_id']].drop_duplicates()
        schema = pa.schema([
            pa.field('id', pa.string()),
            pa.field('data', pa.struct([
                pa.field('name', pa.string()),
                pa.field('place_id', pa.string()),
                pa.field('location', pa.struct([
                    pa.field('lat', pa.float64()),
                    pa.field('lng', pa.float64())
                ])),
                pa.field('h3_index', pa.string()),
                pa.field('address', pa.list_(pa.string())),
                pa.field('timezone', pa.string()),
                pa.field('categories', pa.struct([
                    pa.field('google', pa.list_(pa.string())),
                    pa.field('kuwala', pa.list_(pa.string()))
                ])),
                pa.field('temporarily_closed', pa.bool_()),
                pa.field('permanently_closed', pa.bool_()),
                pa.field('inside_of', pa.string()),
                pa.field('contact', pa.struct([
                    pa.field('phone', pa.string()),
                    pa.field('website', pa.string())
                ])),
                pa.field('opening_hours', pa.list_(pa.struct([
                    pa.field('closing_time', pa.string()),
                    pa.field('opening_time', pa.string()),
                    pa.field('date', pa.string())
                ]))),
                pa.field('rating', pa.struct([
                    pa.field('number_of_reviews', pa.int64()),
                    pa.field('stars', pa.float64())
                ])),
                pa.field('price_level', pa.int64()),
                pa.field('popularity', pa.list_(pa.struct([
                    pa.field('popularity', pa.int64()),
                    pa.field('timestamp', pa.string())
                ]))),
                pa.field('waiting_time', pa.list_(pa.struct([
                    pa.field('waiting_time', pa.int64()),
                    pa.field('timestamp', pa.string())
                ]))),
                pa.field('spending_time', pa.list_(pa.int64()))
            ]))
        ])

        SearchScraper.batch_queries(
            df=pois,
            output_dir=f'../../../../tmp/kuwala/google_files/{continent}/{country}'
                       f'{f"/{country_region}" if country_region else ""}/poi_data/',
            file_name=file_name.replace('search_strings', 'poi_data'),
            query_property='internal_id',
            query_type='poi',
            schema=schema
        )

    """Send search strings to get Google POI ids"""
    @staticmethod
    def send_search_queries(directory, file_name, continent, country, country_region, search_string_basis):
        if search_string_basis == 'osm':
            search_strings = pq.read_table(directory + file_name).to_pandas()[['query']].drop_duplicates()
        else:
            search_strings = pandas.read_csv(directory + file_name.replace('parquet', 'csv'))

        schema = pa.schema([
            pa.field('query', pa.string()),
            pa.field('data', pa.struct([
                pa.field('h3_index', pa.string()),
                pa.field('id', pa.string()),
                pa.field('location', pa.struct([
                    pa.field('lat', pa.float64()),
                    pa.field('lng', pa.float64())
                ])),
                pa.field('name', pa.string())
            ]))
        ])

        SearchScraper.batch_queries(
            df=search_strings,
            output_dir=f'../../../../tmp/kuwala/google_files/{continent}/{country}'
                       f'{f"/{country_region}" if country_region else ""}/search_results/',
            file_name=file_name.replace('strings', 'results'),
            query_property='query',
            query_type='search',
            schema=schema
        )

    """Write scraped POI information to a Parquet file"""
    @staticmethod
    def scrape_with_search_string(continent, country, country_region, search_string_basis='osm'):
        script_dir = os.path.dirname(__file__)
        parquet_files = os.path.join(script_dir, f'../../../../tmp/kuwala/google_files/{continent}/{country}'
                                                 f'{f"/{country_region}" if country_region else ""}/search_strings/')

        if search_string_basis == 'osm':
            file_name = sorted(filter(lambda f: 'osm' in f, os.listdir(parquet_files)), reverse=True)[0]
        else:
            file_name = 'custom_search_strings.parquet'

        SearchScraper.send_search_queries(directory=parquet_files, file_name=file_name, continent=continent,
                                          country=country, country_region=country_region,
                                          search_string_basis=search_string_basis)
        SearchScraper.match_search_results(parquet_files, file_name, search_string_basis=search_string_basis)
        SearchScraper.send_poi_queries(directory=parquet_files, file_name=file_name, continent=continent,
                                       country=country, country_region=country_region)
        SearchScraper.match_poi_results(parquet_files, file_name, search_string_basis=search_string_basis)
