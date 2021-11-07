import argparse
import logging
import os
import sys
from admin_boundary_importer import import_admin_boundaries
from google_osm_poi_matcher import import_google_osm_poi_matching_data
from google_poi_importer import import_google_pois
from osm_poi_importer import import_osm_pois
from population_density_importer import import_population_density
from postgres_controller import send_query
from pyspark.sql import SparkSession

if __name__ == '__main__':
    logging.basicConfig(
        format='%(levelname)s %(asctime)s: %(message)s',
        level=logging.INFO,
        datefmt='%m/%d/%Y %I:%M:%S %p'
    )

    parser = argparse.ArgumentParser()

    parser.add_argument('--continent', help='Continent of the file')
    parser.add_argument('--country', help='Country of the file')
    parser.add_argument('--country_region', help='Country of the file')

    args = parser.parse_args()
    continent = args.continent
    country = args.country
    country_region = args.country_region

    if not (continent and country):
        logging.error('Please provide the continent and country as runtime arguments.')

        sys.exit(1)

    memory = os.getenv('SPARK_MEMORY') or '16g'
    spark = SparkSession.builder \
        .appName('database-importer') \
        .config('spark.driver.memory', memory) \
        .config('spark.jars.packages', 'org.postgresql:postgresql:42.3.0') \
        .getOrCreate() \
        .newSession()
    database_host = os.getenv('DATABASE_HOST') or 'localhost'
    database_name = os.getenv('DATABASE_NAME') or 'kuwala'
    database_user = os.getenv('DATABASE_USER') or 'kuwala'
    database_password = os.getenv('DATABASE_PASSWORD') or 'password'
    database_url = f'jdbc:postgresql://{database_host}:5432/{database_name}'
    database_properties = dict(user=database_user, password=database_password, driver='org.postgresql.Driver',
                               stringtype='unspecified')

    send_query(database_host=database_host, database_name=database_name, database_user=database_user,
               database_password=database_password, path_to_query_file='../sql/create_tables.sql')
    import_admin_boundaries(spark=spark, database_host=database_host, database_name=database_name,
                            database_url=database_url, database_properties=database_properties, continent=continent,
                            country=country, country_region=country_region)
    import_population_density(spark=spark, database_url=database_url, database_properties=database_properties,
                              continent=continent, country=country)
    import_osm_pois(spark=spark, database_url=database_url, database_properties=database_properties,
                    continent=continent, country=country, country_region=country_region)
    import_google_pois(spark=spark, database_url=database_url, database_properties=database_properties,
                       continent=continent, country=country, country_region=country_region)
    import_google_osm_poi_matching_data(spark=spark, database_url=database_url, database_properties=database_properties,
                                        continent=continent, country=country, country_region=country_region)
