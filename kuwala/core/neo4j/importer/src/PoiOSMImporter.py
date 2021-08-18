import h3
import json
import os
import time
import Neo4jConnection as Neo4jConnection
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, concat, lit
from python_utils.src.FileSelector import select_osm_file
from python_utils.src.spark_udfs import concat_list_of_key_value_pairs


#  Sets uniqueness constraint for H3 indexes, OSM POIS, and POI categories
def add_constraints():
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiOsm IF NOT EXISTS ON (p:PoiOSM) ASSERT (p.id) IS UNIQUE')
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiCategory IF NOT EXISTS ON (p:PoiCategory) ASSERT p.name IS '
                                'UNIQUE')
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiBuildingFootprintOsm IF NOT EXISTS ON '
                                '(p:PoiBuildingFootprintOSM) ASSERT (p.id) IS UNIQUE')


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
        MERGE (po:PoiOSM { id: event.id })
        SET 
            po.osmId = event.osmId,
            po.type = event.type,
            po.name = event.name, 
            po.osmTags = event.osm_tags,
            po.houseNr = event.houseNr,
            po.houseName = event.houseName,
            po.block = event.block,
            po.street = event.street,
            po.place = event.place,
            po.zipCode = event.zipCode,
            po.city = event.city,
            po.country = event.country,
            po.full = event.full,
            po.neighborhood = event.neighborhood,
            po.suburb = event.suburb,
            po.district = event.district,
            po.province = event.province,
            po.state = event.state,
            po.level = event.level,
            po.flats = event.flats,
            po.unit = event.unit

        // Create H3 index nodes
        WITH event, po
        MERGE (h:H3Index { h3Index: event.h3_index })
        ON CREATE SET h.resolution = event.resolution
        MERGE (po)-[:LOCATED_AT]->(h)

        // Create relationship to PoiCategories
        WITH event, po
        MATCH (pc:PoiCategory) 
        WHERE pc.name IN event.categories
        MERGE (po)-[:BELONGS_TO]->(pc)
    '''

    if 'region' in df.columns:
        df = df.select('*', 'region.*')
        df = df.drop('region')  # Necessary to drop because batch insert can only process elementary data types

    if 'details' in df.columns:
        df = df.select('*', 'details.*')
        df = df.drop('details')  # Necessary to drop because batch insert can only process elementary data types

    Neo4jConnection.write_df_to_neo4j_with_override(df, query)


def add_osm_building_footprints(df: DataFrame):
    query = '''
        MATCH (po:PoiOSM { id: event.id })
        WITH po, event
        MERGE (pbf:PoiBuildingFootprintOSM { id: event.id })
        ON CREATE SET pbf.geoJson = event.geo_json
        WITH po, pbf
        MERGE (po)-[:HAS]->(pbf)
    '''

    Neo4jConnection.write_df_to_neo4j_with_override(df, query)


def import_pois_osm(limit=None):
    script_dir = os.path.dirname(__file__)
    directory = os.path.join(script_dir, '../tmp/kuwala/osmFiles/parquet')
    file_path = select_osm_file(directory)

    if not file_path:
        print('No OSM POI data available. You first need to run the osm-poi processing pipeline before loading it '
              'into the graph')

        return

    start_time = time.time()

    Neo4jConnection.connect_to_graph()
    add_constraints()
    add_poi_categories()
    Neo4jConnection.close_connection()

    spark = SparkSession.builder.appName('neo4j_importer_osm-poi').getOrCreate().newSession()
    df = spark.read.parquet(f'{file_path}/kuwala.parquet')

    if limit is not None:
        df = df.limit(limit)

    df = df \
        .withColumn('osm_id', col('id')) \
        .withColumn('id', concat('osm_type', 'osm_id')) \
        .withColumn('osm_tags', concat_list_of_key_value_pairs(col('tags')))

    # noinspection PyUnresolvedReferences
    resolution = h3.h3_get_resolution(df.first()['h3_index'])
    osm_pois = df.select(
        'id',
        'osm_id',
        'type',
        'name',
        'osm_tags',
        'h3_index',
        'categories',
        'address.*',
        'website',
        'email',
        'phone'
    ).withColumn('resolution', lit(resolution))

    add_osm_pois(osm_pois)

    osm_pois_with_geo_json = df.select('id', 'geo_json').filter(col('geo_json').isNotNull())

    add_osm_building_footprints(osm_pois_with_geo_json)

    end_time = time.time()

    print(f'Imported OSM data in {round(end_time - start_time)} s')

    return df
