import h3
import json
import os
import src.neo4j.Neo4jConnection as Neo4jConnection
import src.neo4j.PipelineImporter as PipelineImporter
from pyspark.sql.functions import flatten, lit


#  Sets uniqueness constraint for H3 indexes, OSM POIS, and POI categories
def add_constraints():
    Neo4jConnection.query_graph('CREATE CONSTRAINT h3Index IF NOT EXISTS ON (h:H3Index) ASSERT h.h3Index IS UNIQUE')
    Neo4jConnection.query_graph(
        'CREATE CONSTRAINT poiOsm IF NOT EXISTS ON (po:PoiOSM) ASSERT (po.osmId, po.type) IS NODE KEY')
    Neo4jConnection.query_graph(
        'CREATE CONSTRAINT poiCategory IF NOT EXISTS ON (pc:PoiCategory) ASSERT pc.name IS UNIQUE')


def add_poi_categories():
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, '../../resources/poiCategories.json')

    with open(file_path, 'r') as json_file:
        categories = list(json.load(json_file).values())
        query = '''
                UNWIND $rows AS row
                MERGE (:PoiCategory { name: row.category })
                '''

        Neo4jConnection.query_graph(query, parameters={'rows': categories})


def add_osm_pois(df):
    query = '''
        // Create PoiOSM nodes
        UNWIND $rows AS row
        MERGE (po:PoiOSM { osmId: row.osmId, type: row.type })
        SET po.name = row.name, po.osmTags = row.osmTags

        // Create H3 index nodes
        WITH row, po
        MERGE (h:H3Index { h3Index: row.h3Index })
        ON CREATE SET h.resolution = row.resolution
        MERGE (po)-[:LOCATED_AT]->(h)

        // Create relationship to PoiCategories
        WITH row, po
        MATCH (pc:PoiCategory) 
        WHERE pc.name IN row.categories
        MERGE (po)-[:BELONGS_TO]->(pc)
    '''

    df.foreachPartition(lambda partition: Neo4jConnection.batch_insert_data(partition, query))


def add_osm_poi_addresses(df):
    query = '''
        UNWIND $rows AS row
        MATCH (p:PoiOSM)
        WHERE p.osmId = row.osmId AND p.type = row.type
        MERGE (p)-[:HAS]->(pao:PoiAddressOSM)
        SET 
            pao.houseNr = row.houseNr,
            pao.houseName = row.houseName,
            pao.block = row.block,
            pao.street = row.street,
            pao.place = row.place,
            pao.zipCode = row.zipCode,
            pao.city = row.city,
            pao.country = row.country,
            pao.full = row.full,
            pao.neighborhood = row.neighborhood,
            pao.suburb = row.suburb,
            pao.district = row.district,
            pao.province = row.province,
            pao.state = row.state,
            pao.level = row.level,
            pao.flats = row.flats,
            pao.unit = row.unit
    '''

    if 'region' in df.columns:
        df = df.select('*', 'region.*')
        df = df.drop('region')  # Necessary to drop because batch insert can only process elementary data types

    if 'details' in df.columns:
        df = df.select('*', 'details.*')
        df = df.drop('details')  # Necessary to drop because batch insert can only process elementary data types

    df.foreachPartition(lambda partition: Neo4jConnection.batch_insert_data(partition, query))


def import_pois_osm(limit=None):
    Neo4jConnection.connect_to_graph(uri="bolt://localhost:7687",
                                     user="neo4j",
                                     password="password")
    spark = PipelineImporter.connect_to_mongo('osm-poi', 'pois')
    df = spark.read.format('com.mongodb.spark.sql.DefaultSource').load()
    # TODO: Figure out how to join elements of an array that contains arrays of string pairs
    df = df.withColumn('osmId', df['osmId'].cast('Integer')).withColumn('osmTags', flatten('osmTags'))

    add_constraints()
    add_poi_categories()
    # Closing because following functions are multi-threaded and don't use this connection
    Neo4jConnection.close_connection()

    # noinspection PyUnresolvedReferences
    resolution = h3.h3_get_resolution(df.first()['h3Index'])
    osm_pois = df.select(
        'osmId',
        'type',
        'name',
        'osmTags',
        'h3Index',
        'categories'
    ).withColumn('resolution', lit(resolution))
    osm_poi_address = df.filter(df.address.isNotNull()).select(
        'osmId',
        'type',
        'address.*'
    )

    if limit is not None:
        osm_pois = osm_pois.limit(limit)
        osm_poi_address = osm_poi_address.limit(limit)

    add_osm_pois(osm_pois)
    add_osm_poi_addresses(osm_poi_address)

    spark.stop()
