import h3
import json
import os
import Neo4jConnection as Neo4jConnection
import PipelineImporter as PipelineImporter
from pyspark.sql import DataFrame
from pyspark.sql.functions import flatten, lit


#  Sets uniqueness constraint for H3 indexes, OSM POIS, and POI categories
def add_constraints():
    Neo4jConnection.query_graph('CREATE CONSTRAINT h3Index IF NOT EXISTS ON (h:H3Index) ASSERT h.h3Index IS UNIQUE')
    # TODO: Create alternative constraint for community version (Node key only available in Neo4j Enterprise)
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiOsm IF NOT EXISTS ON (po:PoiOSM) ASSERT (po.osmId, po.type) IS '
                                'NODE KEY')
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiCategory IF NOT EXISTS ON (pc:PoiCategory) ASSERT pc.name IS '
                                'UNIQUE')


def add_poi_categories():
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, '../resources/poiCategories.json')

    with open(file_path, 'r') as json_file:
        categories = list(json.load(json_file).values())
        query = '''
                UNWIND $rows AS row
                MERGE (:PoiCategory { name: row.category })
                '''

        Neo4jConnection.query_graph(query, parameters={'rows': categories})


def add_osm_pois(df: DataFrame):
    query = '''
        // Create PoiOSM nodes
        UNWIND $rows AS row
        MERGE (po:PoiOSM { osmId: row.osmId, type: row.type })
        SET 
            po.name = row.name, 
            po.osmTags = row.osmTags,
            po.houseNr = row.houseNr,
            po.houseName = row.houseName,
            po.block = row.block,
            po.street = row.street,
            po.place = row.place,
            po.zipCode = row.zipCode,
            po.city = row.city,
            po.country = row.country,
            po.full = row.full,
            po.neighborhood = row.neighborhood,
            po.suburb = row.suburb,
            po.district = row.district,
            po.province = row.province,
            po.state = row.state,
            po.level = row.level,
            po.flats = row.flats,
            po.unit = row.unit

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

    if 'region' in df.columns:
        df = df.select('*', 'region.*')
        df = df.drop('region')  # Necessary to drop because batch insert can only process elementary data types

    if 'details' in df.columns:
        df = df.select('*', 'details.*')
        df = df.drop('details')  # Necessary to drop because batch insert can only process elementary data types

    df.foreachPartition(lambda p: Neo4jConnection.batch_insert_data(p, query))


def import_pois_osm(limit=None):
    Neo4jConnection.connect_to_graph()

    spark = PipelineImporter.connect_to_mongo(database='osm-poi', collection='pois')
    df = spark.read.format('mongo').load()

    if len(df.columns) < 1:
        print('No OSM POI data available. You first need to run the osm-poi processing pipeline before loading it '
              'into the graph')

        return

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
        'categories',
        'address.*'
    ).withColumn('resolution', lit(resolution))

    if limit is not None:
        osm_pois = osm_pois.limit(limit)

    add_osm_pois(osm_pois)

    spark.stop()
