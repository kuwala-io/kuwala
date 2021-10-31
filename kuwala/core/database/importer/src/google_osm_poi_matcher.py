import logging
import os
import time


def import_google_osm_poi_matching_data(spark, database_url, database_properties, continent, country, country_region):
    start_time = time.time()

    logging.info(f'Starting import of Google-OSM-POI matching data for '
                 f'{f"{country_region}, " if country_region else ""}{country}, {continent}')

    script_dir = os.path.dirname(__file__)
    poi_data_dir = os.path.join(script_dir,
                                f'../../../../tmp/kuwala/google_files/{continent}/{country}'
                                f'{f"/{country_region}" if country_region else ""}/search_results')
    file_path = os.path.join(poi_data_dir,
                             sorted(filter(lambda f: 'matched' in f, os.listdir(poi_data_dir)), reverse=True)[0])
    data = spark.read.parquet(file_path)

    data.write \
        .jdbc(url=database_url, table='google_osm_poi_matching', mode='overwrite', properties=database_properties)
    logging.info(f'Successfully imported Google-OSM-POI matching data for '
                 f'{f"{country_region}, " if country_region else ""}{country}, {continent} after '
                 f'{round(time.time() - start_time)} s')
