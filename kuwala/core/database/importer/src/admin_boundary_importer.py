import logging
import os
import time
from postgres_controller import send_query


def import_admin_boundaries(spark, database_host, database_name, database_url, database_properties, continent, country,
                            country_region):
    start_time = time.time()

    logging.info(f'Starting import of admin boundaries for '
                 f'{f"{country_region}, " if country_region else ""}{country}, {continent}')

    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir,
                             f'../../../../tmp/kuwala/admin_boundary_files/{continent}/{country}'
                             f'{f"/{country_region}" if country_region else ""}/admin_boundaries.parquet')

    if not os.path.exists(file_path):
        logging.warning('No admin boundaries file available. Skipping import.')
        return

    data = spark.read.parquet(file_path).coalesce(1).sort('kuwala_admin_level')

    data.write.option('truncate', True).option('batchsize', 1) \
        .jdbc(url=database_url, table='admin_boundary', mode='overwrite', properties=database_properties)

    send_query(database_host=database_host, database_name=database_name,
               database_user=database_properties['user'], database_password=database_properties['password'],
               path_to_query_file='../sql/create_admin_boundary_geometries.sql')

    logging.info(f'Successfully imported admin boundaries for '
                 f'{f"{country_region}, " if country_region else ""}{country}, {continent} after '
                 f'{round(time.time() - start_time)} s')
