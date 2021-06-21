import h3
import moment
import os
import Neo4jConnection as Neo4jConnection
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, explode, lit


def add_constraints():
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiGoogle IF NOT EXISTS ON (p:PoiGoogle) ASSERT p.id IS UNIQUE')
    # TODO: Create alternative constraint for community version (Node key only available in Neo4j Enterprise)
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiOpeningHours IF NOT EXISTS ON (p:PoiOpeningHours) ASSERT '
                                '(p.openingTime, p.closingTime) IS NODE KEY')
    # TODO: Create alternative constraint for community version (Node key only available in Neo4j Enterprise)
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiClosed IF NOT EXISTS ON (p:PoiClosed) ASSERT '
                                '(p.closed, p.permanently) IS NODE KEY')


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


def add_opening_hours(df: DataFrame):
    query = '''
        // Create opening hours and relate them to PoiGoogle nodes
        UNWIND $rows AS row
        MATCH (pg:PoiGoogle { id: row.id })
        WITH pg, row
        MERGE (poh:PoiOpeningHours { 
            openingTime: row.openingTime, closingTime: row.closingTime
        })
        MERGE (pg)-[:HAS { date: row.date }]->(poh)
    '''

    df.foreachPartition(lambda p: Neo4jConnection.batch_insert_data(p, query))


def add_closed_tags(df: DataFrame):
    Neo4jConnection.query_graph('''
        MERGE (:PoiClosed { closed: false, permanently: false })
        MERGE (:PoiClosed { closed: true, permanently: false })
        MERGE (:PoiClosed { closed: true, permanently: true })
    ''')

    query = '''
        UNWIND $rows AS row
        MATCH (pg:PoiGoogle { id: row.id })
        MATCH (pc:PoiClosed)
        WHERE pc.closed = (row.permanentlyClosed OR row.temporarilyClosed) AND pc.permanently = row.permanentlyClosed
        MERGE (pg)-[:IS { date: row.date }]->(pc)
    '''

    df.foreachPartition(lambda p: Neo4jConnection.batch_insert_data(p, query))


def import_pois_google(limit=None):
    Neo4jConnection.connect_to_graph(uri="bolt://localhost:7687",
                                     user="neo4j",
                                     password="password")
    spark = SparkSession.builder.appName('neo4j_importer_google-poi').getOrCreate()
    script_dir = os.path.dirname(__file__)
    parquet_files = os.path.join(script_dir, '../../../../tmp/kuwala/googleFiles/')
    df = spark.read.parquet(parquet_files + sorted(os.listdir(parquet_files), reverse=True)[0])

    if limit is not None:
        df = df.limit(limit)

    add_constraints()
    # Closing because following functions are multi-threaded and don't use this connection
    Neo4jConnection.close_connection()

    # noinspection PyUnresolvedReferences
    resolution = h3.h3_get_resolution(df.first()['h3Index'])
    time_zone = df.first()['timezone']
    date = moment.utcnow().timezone(time_zone).replace(hours=0, minutes=0, seconds=0)

    google_pois = df.select('id', 'h3Index', 'name', 'placeID', 'address', 'timezone', 'contact.*') \
        .withColumn('resolution', lit(resolution))
    opening_hours = df \
        .select('id', 'openingHours') \
        .withColumn('openingHours', explode('openingHours')) \
        .select('id', 'openingHours.*') \
        .filter(col('closingTime').isNotNull() & col('openingTime').isNotNull())
    closed_tags = df.select('id', 'permanentlyClosed', 'temporarilyClosed').withColumn('date', lit(str(date)))

    add_google_pois(google_pois)
    add_opening_hours(opening_hours)
    add_closed_tags(closed_tags)

    spark.stop()
