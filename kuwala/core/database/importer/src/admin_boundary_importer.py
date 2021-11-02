import logging
import os
import time


def import_admin_boundaries(spark, database_url, database_properties, continent, country, country_region):
    start_time = time.time()

    logging.info(f'Starting import of admin boundaries for '
                 f'{f"{country_region}, " if country_region else ""}{country}, {continent}')

    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir,
                             f'../../../../tmp/kuwala/admin_boundary_files/{continent}/{country}'
                             f'{f"/{country_region}" if country_region else ""}/admin_boundaries.parquet')
    data = spark.read.parquet(file_path).coalesce(1).sort('kuwala_admin_level')

    data.write.option('truncate', True).option('batchsize', 1) \
        .jdbc(url=database_url, table='admin_boundary', mode='overwrite', properties=database_properties)
    logging.info(f'Successfully imported admin boundaries for '
                 f'{f"{country_region}, " if country_region else ""}{country}, {continent} after '
                 f'{round(time.time() - start_time)} s')
