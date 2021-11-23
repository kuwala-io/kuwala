import logging
import os
import time


def import_matches(spark, database_url, database_properties, search_results_dir, poi_data_dir, basis):
    search_results_files = sorted(filter(lambda f: basis in f and 'matched' in f, os.listdir(search_results_dir)),
                                  reverse=True)
    poi_data_files = sorted(filter(lambda f: basis in f and 'matched' in f, os.listdir(poi_data_dir)), reverse=True)

    if not (len(search_results_files) and len(poi_data_files)):
        logging.warning(f'No POI matching data for {basis} POIs')

        return

    file_path_search_results = os.path.join(search_results_dir, search_results_files[0])
    file_path_poi_data = os.path.join(poi_data_dir, poi_data_files[0])
    df_search_results = spark.read.parquet(file_path_search_results)
    df_poi_data = spark.read.parquet(file_path_poi_data).dropDuplicates(['internal_id']).select('internal_id')
    df_search_results = df_search_results.join(df_poi_data, on='internal_id', how='inner')

    if basis == 'custom':
        df_search_results = df_search_results.withColumnRenamed('id', 'custom_id').dropDuplicates(['custom_id'])

    df_search_results.write.option('truncate', True) \
        .jdbc(url=database_url, table=f'google_{basis}_poi_matching', mode='overwrite', properties=database_properties)


def import_google_poi_matching_data(spark, database_url, database_properties, continent, country, country_region):
    start_time = time.time()

    logging.info(f'Starting import of Google-POI matching data for '
                 f'{f"{country_region}, " if country_region else ""}{country}, {continent}')

    script_dir = os.path.dirname(__file__)
    search_results_dir = os.path.join(script_dir,
                                      f'../../../../tmp/kuwala/google_files/{continent}/{country}'
                                      f'{f"/{country_region}" if country_region else ""}/search_results')
    poi_data_dir = os.path.join(script_dir,
                                f'../../../../tmp/kuwala/google_files/{continent}/{country}'
                                f'{f"/{country_region}" if country_region else ""}/poi_data')

    if not (os.path.exists(search_results_dir) and os.path.exists(poi_data_dir)):
        logging.warning('Search results and poi data are not both available. Skipping import.')
        return

    import_matches(spark, database_url, database_properties, search_results_dir, poi_data_dir, basis='osm')
    import_matches(spark, database_url, database_properties, search_results_dir, poi_data_dir, basis='custom')

    logging.info(f'Successfully imported Google-POI matching data for '
                 f'{f"{country_region}, " if country_region else ""}{country}, {continent} after '
                 f'{round(time.time() - start_time)} s')
