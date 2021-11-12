import json
import moment
import os
from geojson import Polygon
from python_utils.src.h3_utils import polyfill_polygon
from pyspark.sql import SparkSession
from pyspark.sql.functions import array, array_contains, col, concat_ws, lit, udf
from pyspark.sql.types import StringType
from python_utils.src.spark_udfs import h3_to_parent


def generate_search_strings(continent, country, country_region, polygon_coords=None, polygon_res=None,
                            limit=None):
    memory = os.getenv('SPARK_MEMORY') or '16g'
    spark = SparkSession.builder.appName('google-poi').config('spark.driver.memory', memory).getOrCreate()
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, f'../../../../tmp/kuwala/osm_files/{continent}/{country}'
                                         f'{f"/{country_region}" if country_region else ""}/parquet/kuwala.parquet')
    df = spark.read.parquet(file_path)

    if polygon_coords:
        polygon_coords = json.loads(polygon_coords)
        polygon = Polygon(polygon_coords)
        polygon_resolution = 9

        if polygon_res:
            polygon_resolution = int(polygon_res)

        polygon_cells = polyfill_polygon(polygon, resolution=polygon_resolution)
        df = df.withColumn('h3_polygon', h3_to_parent(col('h3_index'), lit(polygon_resolution)))
        df = df.filter(df.h3Polygon.isin(polygon_cells))

    df = df \
        .filter(
            df.address_street.isNotNull() |
            df.address_house_nr.isNotNull() |
            df.address_zip_code.isNotNull() |
            df.address_city.isNotNull() |
            df.address_full.isNotNull()
        ) \
        .select('osm_id', 'osm_type', 'name', 'h3_index', 'address_street', 'address_house_nr', 'address_zip_code',
                'address_city', 'address_full', 'categories')

    @udf(returnType=StringType())
    def concat_search_strings(strings):
        strings = list(filter(lambda s: s, strings))

        return ', '.join(strings)

    with_public_transport = df \
        .filter(array_contains('categories', 'public_transportation')) \
        .withColumn('station', concat_ws(' ', col('name'), lit('station'))) \
        .withColumn(
            'query',
            concat_search_strings(array(col('station'), concat_ws(' ', col('address_street'), col('address_house_nr')),
                                  col('address_zip_code'), col('address_city')))
        ) \
        .select('osm_id', 'osm_type', 'h3_index', 'name', 'query')
    with_address = df \
        .filter(~array_contains('categories', 'public_transportation') & col('address_full').isNull()) \
        .withColumn(
            'query',
            concat_search_strings(array(col('name'), concat_ws(' ', col('address_street'), col('address_house_nr')),
                                  col('address_zip_code'), col('address_city')))
        ) \
        .select('osm_id', 'osm_type', 'h3_index', 'name', 'query')
    with_address_full = df \
        .filter(~array_contains('categories', 'public_transportation') & col('address_full').isNotNull()) \
        .withColumn('query', concat_search_strings(array(col('name'), col('address_full')))) \
        .select('osm_id', 'osm_type', 'h3_index', 'name', 'query')

    union = with_public_transport.union(with_address).union(with_address_full)

    if limit is not None:
        union = union.limit(limit)

    union.write.parquet(f'../../../../tmp/kuwala/google_files/{continent}/{country}'
                        f'{f"/{country_region}" if country_region else ""}/search_strings/osm_search_strings_'
                        f'{moment.now().format("YYYY-MM-DDTHH-mm-ss")}.parquet')
