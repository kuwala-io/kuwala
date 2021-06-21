import h3
import os
import src.neo4j_importer.Neo4jConnection as Neo4jConnection
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, lit


def add_constraints():
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiGoogle IF NOT EXISTS ON (pg:PoiGoogle) ASSERT pg.id IS UNIQUE')


def add_google_pois(df: DataFrame):
    query = '''
            // Create PoiGoogle nodes
            UNWIND $rows AS row
            MERGE (pg:PoiGoogle { id: row.id })
            SET 
                pg.placeId = row.placeID,
                pg.name = row.name,
                pg.address = row.address,
                pg.phone = row.phone,
                pg.website = row.website,
                pg.timezone = row.timezone

            // Create H3 index nodes
            WITH row, pg
            MERGE (h:H3Index { h3Index: row.h3Index })
            ON CREATE SET h.resolution = row.resolution
            MERGE (pg)-[:LOCATED_AT]->(h)
        '''

    df.foreachPartition(lambda p: Neo4jConnection.batch_insert_data(p, query))


def import_pois_google(limit=None):
    Neo4jConnection.connect_to_graph(uri="bolt://localhost:7687",
                                     user="neo4j",
                                     password="password")
    spark = SparkSession.builder.appName('neo4j_importer').getOrCreate()
    script_dir = os.path.dirname(__file__)
    parquet_files = os.path.join(script_dir, '../../../../kuwala-pipelines/tmp/kuwala/googleFiles/')
    df = spark.read.parquet(parquet_files + sorted(os.listdir(parquet_files), reverse=True)[0])

    add_constraints()
    # Closing because following functions are multi-threaded and don't use this connection
    Neo4jConnection.close_connection()

    # noinspection PyUnresolvedReferences
    resolution = h3.h3_get_resolution(df.first()['h3Index'])
    google_pois = df \
        .select('id', 'h3Index', 'name', 'placeID', 'address', 'timezone', 'contact.*') \
        .withColumn('resolution', lit(resolution)) \

    if limit is not None:
        google_pois = google_pois.limit(limit)

    add_google_pois(google_pois)

    spark.stop()
