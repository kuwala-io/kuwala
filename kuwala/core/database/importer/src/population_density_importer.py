import logging
import os
import time
from pyspark.sql.functions import lit


def import_population_density(spark, database_url, database_properties, continent, country, population_density_date=''):
    start_time = time.time()

    logging.info(f'Starting import of population density data for {country}, {continent}')

    population_density_date = population_density_date.replace('-', '_')
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, f'../../../../tmp/kuwala/population_files/{continent}/{country}'
                                         f'/{population_density_date}_result.parquet')

    if not os.path.exists(file_path):
        logging.warning('No population data available. Skipping import.')
        return

    data = spark.read.parquet(file_path).withColumn('kuwala_import_country', lit(country))

    data.write.option('truncate', True) \
        .jdbc(url=database_url, table='population_density', mode='overwrite', properties=database_properties)
    logging.info(f'Successfully imported population density data for {country}, {continent} after '
                 f'{round(time.time() - start_time)} s')
