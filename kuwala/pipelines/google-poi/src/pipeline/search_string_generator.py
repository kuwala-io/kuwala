import argparse
import json
import moment
import os
from geojson import Polygon
from python_utils.src.h3_utils import polyfill_polygon
from pyspark.sql import SparkSession
from pyspark.sql.functions import array_contains, col, concat_ws, lit
from python_utils.src.spark_udfs import h3_to_parent


def connect_to_mongo(database, collection):
    host = os.getenv('MONGO_HOST') or '127.0.0.1'
    mongo_url = f'mongodb://{host}:27017/{database}.{collection}'
    memory = os.getenv('SPARK_MEMORY') or '16g'

    return SparkSession \
        .builder \
        .appName('google-poi') \
        .config('spark.driver.memory', memory) \
        .config('spark.mongodb.input.uri', mongo_url) \
        .config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector_2.12:3.0.1') \
        .getOrCreate()


def generate_search_strings(limit=None):
    spark = connect_to_mongo('osm-poi', 'pois')
    df = spark.read.format('com.mongodb.spark.sql.DefaultSource').load()
    parser = argparse.ArgumentParser()
    parser.add_argument('--polygon_coords', help='Specify the region that should be scraped')
    parser.add_argument('--polygon_resolution', help='Specify the resolution for the polygon')
    args = parser.parse_args()

    if args.polygon_coords:
        polygon_coords = json.loads(args.polygon_coords)
        polygon = Polygon(polygon_coords)
        polygon_resolution = 9

        if args.polygon_resolution:
            polygon_resolution = int(args.polygon_resolution)

        polygon_cells = polyfill_polygon(polygon, resolution=polygon_resolution)
        df = df.withColumn('h3Polygon', h3_to_parent(col('h3Index'), lit(polygon_resolution)))
        df = df.filter(df.h3Polygon.isin(polygon_cells))

    df = df.filter(df.address.isNotNull()).select('osmId', 'type', 'name', 'h3Index', 'address.*', 'categories')
    with_public_transport = df \
        .filter(array_contains('categories', 'public_transportation')) \
        .withColumn('station', concat_ws(' ', col('name'), lit('station'))) \
        .withColumn(
            'query',
            concat_ws(', ', col('station'), concat_ws(' ', col('street'), col('houseNr')), col('zipCode'), col('city'))
        ) \
        .select('osmId', 'type', 'h3Index', 'name', 'query')
    with_address = df \
        .filter(~array_contains('categories', 'public_transportation')) \
        .withColumn(
            'query',
            concat_ws(', ', col('name'), concat_ws(' ', col('street'), col('houseNr')), col('zipCode'), col('city'))
            if 'full' not in df.columns else
            concat_ws(', ', col('name'), col('full'))
        ) \
        .select('osmId', 'type', 'h3Index', 'name', 'query')

    union = with_public_transport.union(with_address)

    if limit is not None:
        union = union.limit(limit)

    union.write.parquet(f'../../tmp/googleFiles/searchStrings/google_search_strings'
                        f'_{moment.now().format("YYYY-MM-DDTHH-mm-ss")}.parquet')
