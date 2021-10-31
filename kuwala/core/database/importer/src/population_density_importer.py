import logging
import os
import time


def import_population_density(spark, database_url, database_properties, continent, country):
    start_time = time.time()

    logging.info(f'Starting import of population density data for {country}, {continent}')

    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, f'../../../../tmp/kuwala/population_files/{continent}/{country}'
                                         f'/result.parquet')
    data = spark.read.parquet(file_path)

    data.write.jdbc(url=database_url, table='population_density', mode='overwrite', properties=database_properties)
    logging.info(f'Successfully imported population density data for {country}, {continent} after '
                 f'{round(time.time() - start_time)} s')
