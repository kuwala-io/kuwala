import argparse
import json
import moment
import os
from geojson import Polygon
from kuwala.common.python_utils.src.h3_utils import polyfill_polygon
from pyspark.sql import SparkSession
from pyspark.sql.functions import array_contains, col, concat_ws, lit
from kuwala.common.python_utils.src.spark_udfs import h3_to_parent


def generate_search_strings(limit=None):
    memory = os.getenv('SPARK_MEMORY') or '16g'
    spark = SparkSession.builder.appName('google-poi').config('spark.driver.memory', memory).getOrCreate()
    parser = argparse.ArgumentParser()
    parser.add_argument('--continent', help='Continent of the file')
    parser.add_argument('--country', help='Country of the file')
    parser.add_argument('--country_region', help='Country region of the file')
    parser.add_argument('--polygon_coords', help='Specify the region that should be scraped')
    parser.add_argument('--polygon_resolution', help='Specify the resolution for the polygon')
    args = parser.parse_args()

    if not args.continent:
        return RuntimeError('No region parameters specified')

    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, f'../../tmp/osmFiles/parquet/{args.continent}')

    if args.country:
        file_path += f'/{args.country}'

    if args.country_region:
        file_path += f'/{args.country_region}'

    file_path += '/kuwala.parquet'
    df = spark.read.parquet(file_path).withColumnRenamed('h3_index', 'h3Index')

    if args.polygon_coords:
        polygon_coords = json.loads(args.polygon_coords)
        polygon = Polygon(polygon_coords)
        polygon_resolution = 9

        if args.polygon_resolution:
            polygon_resolution = int(args.polygon_resolution)

        polygon_cells = polyfill_polygon(polygon, resolution=polygon_resolution)
        df = df.withColumn('h3Polygon', h3_to_parent(col('h3Index'), lit(polygon_resolution)))
        df = df.filter(df.h3Polygon.isin(polygon_cells))

    df = df \
        .filter(
            df.address.street.isNotNull() |
            df.address.house_nr.isNotNull() |
            df.address.zip_code.isNotNull() |
            df.address.city.isNotNull() |
            df.address.full.isNotNull()
        ) \
        .withColumnRenamed('id', 'osmId') \
        .drop('type') \
        .withColumnRenamed('osm_type', 'type') \
        .select('osmId', 'type', 'name', 'h3Index', 'address.*', 'categories') \
        .withColumnRenamed('house_nr', 'houseNr') \
        .withColumnRenamed('zip_code', 'zipCode')
    with_public_transport = df \
        .filter(array_contains('categories', 'public_transportation')) \
        .withColumn('station', concat_ws(' ', col('name'), lit('station'))) \
        .withColumn(
            'query',
            concat_ws(', ', col('station'), concat_ws(' ', col('street'), col('houseNr')), col('zipCode'), col('city'))
        ) \
        .select('osmId', 'type', 'h3Index', 'name', 'query')
    with_address = df \
        .filter(~array_contains('categories', 'public_transportation') & col('full').isNull()) \
        .withColumn(
            'query',
            concat_ws(', ', col('name'), concat_ws(' ', col('street'), col('houseNr')), col('zipCode'), col('city'))
        ) \
        .select('osmId', 'type', 'h3Index', 'name', 'query')
    with_address_full = df \
        .filter(~array_contains('categories', 'public_transportation') & col('full').isNotNull()) \
        .withColumn('query', concat_ws(', ', col('name'), col('full'))) \
        .select('osmId', 'type', 'h3Index', 'name', 'query')

    union = with_public_transport.union(with_address).union(with_address_full)

    if limit is not None:
        union = union.limit(limit)

    union.write.parquet(f'../../tmp/googleFiles/searchStrings/google_search_strings'
                        f'_{moment.now().format("YYYY-MM-DDTHH-mm-ss")}.parquet')
