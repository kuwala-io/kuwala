import h3
import requests
from fuzzywuzzy import fuzz
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, udf
from pyspark.sql.types import DoubleType, IntegerType


def send_search_query(batch):
    result = requests.request(method='get', url='http://localhost:3003/search', json=batch)

    return result.json()


@udf(returnType=IntegerType())
def get_h3_distance(h1, h2):
    # noinspection PyUnresolvedReferences
    return h3.h3_distance(h1, h2)


@udf(returnType=IntegerType())
def get_name_distance(osm_name, query, google_name):
    return fuzz.token_set_ratio(osm_name, google_name) if osm_name else fuzz.token_set_ratio(query, google_name)


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


def match_results(partition, results):
    spark = SparkSession.builder.appName('google-poi').getOrCreate()
    df_p = spark.createDataFrame(data=partition, schema=['h3Index', 'name', 'query']).alias('df_p')
    df_r = spark.createDataFrame(data=results, schema=['data, query'])
    # noinspection PyTypeChecker
    return df_p \
        .join(df_r, df_p.query == df_r.query, 'inner') \
        .withColumn('data', col('data, query')) \
        .filter(col('data.h3Index').isNotNull()) \
        .withColumn('osmName', col('df_p.name')) \
        .withColumn('googleName', col('data.name')) \
        .withColumn('nameDistance', get_name_distance(col('osmName'), col('df_p.query'), col('googleName'))) \
        .withColumn('h3Distance', get_h3_distance(col('h3Index'), col('data.h3Index'))) \
        .withColumn('confidence', get_confidence(col('h3Distance'), col('nameDistance'))) \
        .select('df_p.query', 'osmName', 'googleName', 'nameDistance', 'h3Distance', 'confidence', 'data.id')


def batch_rows(partition):
    batch = list()
    results = list()
    batch_size = 10

    for row in partition:
        batch.append(row.query)

        if len(batch) == batch_size:
            result = send_search_query(batch)
            batch = list()

            if 'data' in result:
                results.extend(result['data'])

    if len(batch) > 0:
        result = send_search_query(batch)

        if 'data' in result:
            results.extend(result['data'])

    matched_results = match_results(partition, results)
    matched_results.write.mode('append').parquet('../../../tmp/kuwala/googleFiles/search_results')


def scrape_with_search_string(search_strings: DataFrame):
    # search_strings.foreachPartition(lambda p: batch_rows(p))
    batch_rows(search_strings.take(20))
