import src.neo4j_importer.Neo4jConnection as Neo4jConnection
from pyspark.sql import SparkSession
from src.neo4j_importer.PoiGoogleImporter import import_pois_google
from src.neo4j_importer.PoiOSMImporter import import_pois_osm
from src.neo4j_importer.PopulationDensityImporter import import_population_density


def connect_to_mongo(database, collection):
    mongo_url = f'mongodb://127.0.0.1:27017/{database}.{collection}'

    return SparkSession \
        .builder \
        .appName('neo4j_importer') \
        .config('spark.mongodb.input.uri', mongo_url) \
        .config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector_2.12:3.0.1') \
        .getOrCreate()


def import_pipelines():
    import_pois_osm()
    import_pois_google()
    import_population_density()


# Create relationships from high resolution H3 indexes to lower resolution H3 indexes
def connect_pipelines():
    Neo4jConnection.connect_to_graph(uri="bolt://localhost:7687",
                                     user="neo4j",
                                     password="password")

    query_resolutions = '''
        MATCH (h:H3Index)
        WITH DISTINCT h.resolution AS resolutions
        ORDER BY resolutions DESC
        RETURN resolutions
    '''
    resolutions = Neo4jConnection.query_graph(query_resolutions)

    # Find parents of children and connect them
    for i, resolution in enumerate(resolutions):
        if i < len(resolutions) - 1:
            query_connect_to_parent = f'''
                MATCH (h1:H3Index)
                WHERE h1.resolution = {resolution[0]} 
                MATCH (h2:H3Index)
                WHERE h2.h3Index = io.kuwala.h3.h3ToParent(h1.h3Index, {resolutions[i + 1][0]})
                MERGE (h1)-[:CHILD_OF]->(h2)
            '''

            Neo4jConnection.query_graph(query_connect_to_parent)

    Neo4jConnection.close_connection()
