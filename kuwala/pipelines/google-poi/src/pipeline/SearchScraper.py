import moment
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
from kuwala.common.python_utils.src.spark_udfs import get_confidence_based_h3_and_name_distance, get_h3_distance, get_string_distance
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
            print(f'[{moment.now().format("YYYY-MM-DDTHH-mm-ss")}]: Search query failed: ', e)
            print(f'[{moment.now().format("YYYY-MM-DDTHH-mm-ss")}]: Continuing without batch.')

            return None

    """Match the queries that have been sent to the received results"""
    @staticmethod
    def match_search_results(directory: str, file_name: str):
        memory = os.getenv('SPARK_MEMORY') or '16g'
        spark = SparkSession.builder.appName('google-poi').config('spark.driver.memory', memory).getOrCreate()
        df_str = spark.read.parquet(directory + file_name)
        path_results = directory.replace('Strings', 'Results') + file_name.replace('strings', 'results')
        df_res = spark.read.parquet(path_results)
        # noinspection PyTypeChecker
        df_res = df_str \
            .alias('df_str') \
            .join(df_res, df_str.query == df_res.query, 'inner') \
            .filter(col('data.h3Index').isNotNull()) \
            .withColumn('osmName', col('df_str.name')) \
            .withColumn('googleName', col('data.name')) \
            .withColumn(
                'nameDistance',
                get_string_distance(col('googleName'), col('osmName'), col('df_str.query'))
            ) \
            .withColumn('h3Distance', get_h3_distance(col('h3Index'), col('data.h3Index'), lit(MAX_H3_DISTANCE))) \
            .withColumn(
                'confidence',
                get_confidence_based_h3_and_name_distance(col('h3Distance'), col('nameDistance'), lit(MAX_H3_DISTANCE))
            ) \
            .select('osmId', 'type', 'confidence', 'data.id')

        df_res.write.parquet(path_results.replace('results', 'results_matched'))

    """Match the POI ids that have been sent to the received results"""
    @staticmethod
    def match_poi_results(directory: str, file_name: str):
        memory = os.getenv('SPARK_MEMORY') or '16g'
        spark = SparkSession.builder.appName('google-poi').config('spark.driver.memory', memory).getOrCreate()
        df_res = spark.read.parquet(
            directory.replace('Strings', 'Results') + file_name.replace('strings', 'results_matched')
        )
        path_poi_data = directory.replace('searchStrings', 'poiData') + file_name.replace('search_strings', 'poi_data')
        df_pd = spark.read.parquet(path_poi_data)

        # noinspection PyTypeChecker
        df_pd = df_res \
            .alias('df_res') \
            .join(df_pd, df_res.id == df_pd.id, 'inner') \
            .filter(col('data.h3Index').isNotNull()) \
            .select('osmId', 'type', 'confidence', col('df_res.id').alias('id'), 'data.*')

        df_pd.write.parquet(path_poi_data.replace('poi_data', 'poi_data_matched'))

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
                            print(f'[{moment.now().format("YYYY-MM-DDTHH-mm-ss")}]: Request timed out too many times. '
                                  f'Skipping batch')

                batch = list()

        if writer:
            writer.close()

    """Send Google POI ids to retrieve all POI information"""
    @staticmethod
    def send_poi_queries(directory: str, file_name: str):
        pois = pq \
            .read_table(directory.replace('Strings', 'Results') + file_name.replace('strings', 'results_matched')) \
            .to_pandas()
        pois = pois[['id']].drop_duplicates()
        schema = pa.schema([
            pa.field('id', pa.string()),
            pa.field('data', pa.struct([
                pa.field('name', pa.string()),
                pa.field('placeID', pa.string()),
                pa.field('location', pa.struct([
                    pa.field('lat', pa.float64()),
                    pa.field('lng', pa.float64())
                ])),
                pa.field('h3Index', pa.string()),
                pa.field('address', pa.list_(pa.string())),
                pa.field('timezone', pa.string()),
                pa.field('categories', pa.struct([
                    pa.field('google', pa.list_(pa.string())),
                    pa.field('kuwala', pa.list_(pa.string()))
                ])),
                pa.field('temporarilyClosed', pa.bool_()),
                pa.field('permanentlyClosed', pa.bool_()),
                pa.field('insideOf', pa.string()),
                pa.field('contact', pa.struct([
                    pa.field('phone', pa.string()),
                    pa.field('website', pa.string())
                ])),
                pa.field('openingHours', pa.list_(pa.struct([
                    pa.field('closingTime', pa.string()),
                    pa.field('openingTime', pa.string()),
                    pa.field('date', pa.string())
                ]))),
                pa.field('rating', pa.struct([
                    pa.field('numberOfReviews', pa.int64()),
                    pa.field('stars', pa.float64())
                ])),
                pa.field('priceLevel', pa.int64()),
                pa.field('popularity', pa.list_(pa.struct([
                    pa.field('popularity', pa.int64()),
                    pa.field('timestamp', pa.string())
                ]))),
                pa.field('waitingTime', pa.list_(pa.struct([
                    pa.field('waitingTime', pa.int64()),
                    pa.field('timestamp', pa.string())
                ]))),
                pa.field('spendingTime', pa.list_(pa.int64()))
            ]))
        ])

        SearchScraper.batch_queries(
            df=pois,
            output_dir=f'../../tmp/googleFiles/poiData/',
            file_name=file_name.replace('search_strings', 'poi_data'),
            query_property='id',
            query_type='poi',
            schema=schema
        )

    """Send search strings to get Google POI ids"""
    @staticmethod
    def send_search_queries(directory: str, file_name: str):
        search_strings = pq.read_table(directory + file_name).to_pandas()
        schema = pa.schema([
            pa.field('query', pa.string()),
            pa.field('data', pa.struct([
                pa.field('h3Index', pa.string()),
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
            output_dir=f'../../tmp/googleFiles/searchResults/',
            file_name=file_name.replace('strings', 'results'),
            query_property='query',
            query_type='search',
            schema=schema
        )

    """Write scraped POI information to a Parquet file"""
    @staticmethod
    def scrape_with_search_string():
        script_dir = os.path.dirname(__file__)
        parquet_files = os.path.join(script_dir, '../../tmp/googleFiles/searchStrings/')
        file_name = sorted(os.listdir(parquet_files), reverse=True)[0]

        SearchScraper.send_search_queries(parquet_files, file_name)
        SearchScraper.match_search_results(parquet_files, file_name)
        SearchScraper.send_poi_queries(parquet_files, file_name)
        SearchScraper.match_poi_results(parquet_files, file_name)
