import logging
import os
import time


def import_google_osm_poi_matching_data(spark, database_url, database_properties, continent, country, country_region):
    start_time = time.time()

    logging.info(f'Starting import of Google-OSM-POI matching data for '
                 f'{f"{country_region}, " if country_region else ""}{country}, {continent}')

    script_dir = os.path.dirname(__file__)
    search_results_dir = os.path.join(script_dir,
                                      f'../../../../tmp/kuwala/google_files/{continent}/{country}'
                                      f'{f"/{country_region}" if country_region else ""}/search_results')
    poi_data_dir = os.path.join(script_dir,
                                f'../../../../tmp/kuwala/google_files/{continent}/{country}'
                                f'{f"/{country_region}" if country_region else ""}/poi_data')
    file_path_search_results = os.path.join(search_results_dir,
                                            sorted(filter(lambda f: 'matched' in f, os.listdir(search_results_dir)),
                                                   reverse=True)[0])
    file_path_poi_data = os.path.join(poi_data_dir,
                                      sorted(filter(lambda f: 'matched' in f, os.listdir(poi_data_dir)),
                                             reverse=True)[0])
    df_search_results = spark.read.parquet(file_path_search_results).dropDuplicates(['internal_id'])
    df_poi_data = spark.read.parquet(file_path_poi_data).dropDuplicates(['internal_id']).select('internal_id')
    df_search_results = df_search_results.join(df_poi_data, on='internal_id', how='inner')

    df_search_results.write.option('truncate', True) \
        .jdbc(url=database_url, table='google_osm_poi_matching', mode='overwrite', properties=database_properties)
    logging.info(f'Successfully imported Google-OSM-POI matching data for '
                 f'{f"{country_region}, " if country_region else ""}{country}, {continent} after '
                 f'{round(time.time() - start_time)} s')
