# noinspection PyUnresolvedReferences
import src.neo4j.Neo4jConnection as Neo4jConnection
from pyspark.sql import SparkSession
# noinspection PyUnresolvedReferences
from src.neo4j.PoiOSMImporter import import_pois_osm
# noinspection PyUnresolvedReferences
from src.neo4j.PopulationDensityImporter import import_population_density


def connect_to_mongo(database, collection):
    mongo_url = f'mongodb://127.0.0.1:27017/{database}.{collection}'

    return SparkSession \
        .builder \
        .appName('osmPoi') \
        .config('spark.mongodb.input.uri', mongo_url) \
        .config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector_2.12:3.0.1') \
        .getOrCreate()


def import_pipelines():
    import_pois_osm()
    import_population_density()


# Create relationships from high resolution H3 indexes to lower resolution H3 indexes
def connect_pipelines():
    Neo4jConnection.connect_to_graph(uri="bolt://localhost:7687",
                                     user="neo4j",
                                     password="password")

    query = ''''''  # TODO: Write udf

    Neo4jConnection.query_graph(query)
    Neo4jConnection.close_connection()
