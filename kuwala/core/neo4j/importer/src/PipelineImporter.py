import os
from PipelineConnector import connect_h3_indexes, connect_pois
from PoiGoogleImporter import import_pois_google
from PoiOSMImporter import import_pois_osm
from PopulationDensityImporter import import_population_density
from pyspark.sql import SparkSession


def connect_to_mongo(database, collection):
    host = os.getenv('MONGO_HOST') or '127.0.0.1'
    mongo_url = f'mongodb://{host}:27017/{database}.{collection}'

    return SparkSession \
        .builder \
        .appName(f'neo4j_importer_{database}') \
        .getOrCreate() \
        .newSession() \
        .read \
        .format('mongo') \
        .option('uri', mongo_url) \
        .load()


def start():
    SparkSession.builder.config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector_2.12:3.0.1')

    # Import data
    df_pois_osm = import_pois_osm()
    df_pois_google = import_pois_google()
    import_population_density()

    # Connect data
    connect_pipelines(df_pois_osm, df_pois_google)


def connect_pipelines(df_pois_osm, df_pois_google):
    connect_pois(df_pois_osm, df_pois_google)
    connect_h3_indexes()
