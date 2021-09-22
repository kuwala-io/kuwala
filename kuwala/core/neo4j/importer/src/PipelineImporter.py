import os
import Neo4jConnection as Neo4jConnection
from PipelineConnector import connect_h3_indexes, connect_pois
from PoiGoogleImporter import import_pois_google
from PoiOSMImporter import import_pois_osm
from PopulationDensityImporter import import_population_density
from pyspark.sql import SparkSession


def add_constraints():
    # Create general H3 constraint
    Neo4jConnection.connect_to_graph()
    Neo4jConnection.query_graph('CREATE CONSTRAINT h3Index IF NOT EXISTS ON (h:H3Index) ASSERT h.h3Index IS UNIQUE')
    Neo4jConnection.close_connection()


def start(args):
    memory = os.getenv('SPARK_MEMORY') or '16g'
    SparkSession.builder \
        .config('spark.driver.memory', memory) \
        .config('spark.jars.packages', 'neo4j-contrib:neo4j-connector-apache-spark_2.12:4.0.1_for_spark_3') \
        .getOrCreate()

    add_constraints()
    import_population_density(args)

    df_pois_osm = import_pois_osm(args)
    df_pois_google = import_pois_google()

    connect_pipelines(df_pois_osm, df_pois_google)


def connect_pipelines(df_pois_osm, df_pois_google):
    if df_pois_osm and df_pois_google:
        connect_pois(df_pois_osm, df_pois_google)

    connect_h3_indexes()
