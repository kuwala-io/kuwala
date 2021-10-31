import logging
import os
import time
from pyspark.sql.functions import col, explode


def import_google_pois(spark, database_url, database_properties, continent, country, country_region):
    start_time = time.time()

    logging.info(f'Starting import of Google POIs for {f"{country_region}, " if country_region else ""}'
                 f'{country}, {continent}')

    script_dir = os.path.dirname(__file__)
    poi_data_dir = os.path.join(script_dir,
                                f'../../../../tmp/kuwala/google_files/{continent}/{country}'
                                f'{f"/{country_region}" if country_region else ""}/poi_data')
    file_path = os.path.join(poi_data_dir,
                             sorted(filter(lambda f: 'matched' in f, os.listdir(poi_data_dir)), reverse=True)[0])
    data = spark.read.parquet(file_path).dropDuplicates(['internal_id'])
    poi_data = data\
        .withColumn('has_popularity', col('popularity').isNotNull()) \
        .withColumn('has_opening_hours', col('opening_hours').isNotNull()) \
        .withColumn('has_waiting_time', col('waiting_time').isNotNull()) \
        .drop('osm_id', 'osm_type', 'confidence', 'opening_hours', 'popularity', 'waiting_time')
    popularity_data = data.select('internal_id', 'popularity').withColumn('popularity', explode('popularity')) \
        .select('internal_id', col('popularity.popularity').alias('popularity'),
                col('popularity.timestamp').alias('timestamp'))
    opening_hours_data = data.select('internal_id', 'opening_hours') \
        .withColumn('opening_hours', explode('opening_hours')) \
        .select('internal_id', col('opening_hours.date').alias('date'),
                col('opening_hours.opening_time').alias('opening_time'),
                col('opening_hours.closing_time').alias('closing_time'))
    waiting_time_data = data.select('internal_id', 'waiting_time') \
        .withColumn('waiting_time', explode('waiting_time')) \
        .select('internal_id', col('waiting_time.waiting_time').alias('waiting_time'),
                col('waiting_time.timestamp').alias('timestamp'))

    logging.info('Importing POIs')
    poi_data.write.option('truncate', True).option('cascadeTruncate', True) \
        .jdbc(url=database_url, table='google_poi', mode='overwrite', properties=database_properties)
    logging.info('Importing popularities')
    popularity_data.write \
        .jdbc(url=database_url, table='google_poi_popularity', mode='overwrite', properties=database_properties)
    logging.info('Importing opening hours')
    opening_hours_data.write \
        .jdbc(url=database_url, table='google_poi_opening_hours', mode='overwrite', properties=database_properties)
    logging.info('Importing waiting times')
    waiting_time_data.write \
        .jdbc(url=database_url, table='google_poi_waiting_time', mode='overwrite', properties=database_properties)
    logging.info(f'Successfully imported Google POIs for {f"{country_region}, " if country_region else ""}{country}, '
                 f'{continent} after {round(time.time() - start_time)} s')
