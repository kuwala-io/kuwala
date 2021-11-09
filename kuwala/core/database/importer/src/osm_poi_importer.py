import logging
import os
import time
from pyspark.sql.functions import col, lit, udf
from pyspark.sql.types import ArrayType, StringType


def import_osm_pois(spark, database_url, database_properties, continent, country, country_region):
    start_time = time.time()

    logging.info(f'Starting import of OSM POIs for {f"{country_region}, " if country_region else ""}'
                 f'{country}, {continent}')

    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir,
                             f'../../../../tmp/kuwala/osm_files/{continent}/{country}'
                             f'{f"/{country_region}" if country_region else ""}/parquet/kuwala.parquet')

    if not os.path.exists(file_path):
        logging.warning('No OSM data available. Skipping import.')
        return

    @udf(returnType=ArrayType(elementType=StringType()))
    def concat_tags(tags):
        return list(map(lambda tag: f'{tag["key"]}={tag["value"]}', tags))

    data = spark.read.parquet(file_path).withColumn('tags', concat_tags(col('tags')))

    data.write.option('truncate', True).option('cascadeTruncate', True) \
        .jdbc(url=database_url, table='osm_poi', mode='overwrite', properties=database_properties)
    logging.info(f'Successfully imported OSM POIs for {f"{country_region}, " if country_region else ""}{country}, '
                 f'{continent} after {round(time.time() - start_time)} s')
