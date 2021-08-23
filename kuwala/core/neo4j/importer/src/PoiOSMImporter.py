import h3
import json
import os
import time
import Neo4jConnection as Neo4jConnection
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, concat, lit
from python_utils.src.FileSelector import select_local_osm_file
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
    query_poi_osm = '''
        MERGE (po:PoiOSM { id: event.id })
        ON CREATE SET 
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
    '''
    query_h3_indexes = 'MERGE (h:H3Index { h3Index: event.h3_index, resolution: event.resolution })'
    query_located_at = '''
        MATCH (po:PoiOSM { id: event.id })
        WITH event, po
        MATCH (h:H3Index { h3Index: event.h3_index })
        MERGE (po)-[:LOCATED_AT]->(h)
    '''
    query_belongs_to = '''
        MATCH (po:PoiOSM { id: event.id })
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

    Neo4jConnection.write_df_to_neo4j_with_override(df, query_poi_osm)
    Neo4jConnection.write_df_to_neo4j_with_override(df.filter(col('h3_index').isNotNull()).sort('h3_index'), query_h3_indexes)
    Neo4jConnection.write_df_to_neo4j_with_override(df.filter(col('h3_index').isNotNull()).sort('h3_index'), query_located_at)
    Neo4jConnection.write_df_to_neo4j_with_override(df.repartition(1), query_belongs_to)


def add_osm_building_footprints(df: DataFrame):
    query_building_footprint = '''
        MERGE (pbf:PoiBuildingFootprintOSM { id: event.id })
        ON CREATE SET pbf.geoJson = event.geo_json
    '''
    query_relationships = '''
        MATCH (po:PoiOSM { id: event.id })
        WITH po, event
        MATCH (pbf:PoiBuildingFootprintOSM { id: event.id })
        WITH po, pbf
        MERGE (po)-[:HAS]->(pbf)
    '''

    Neo4jConnection.write_df_to_neo4j_with_override(df, query_building_footprint)
    Neo4jConnection.write_df_to_neo4j_with_override(df, query_relationships)


def import_pois_osm(args, limit=None):
    script_dir = os.path.dirname(__file__)
    directory = os.path.join(script_dir, '../tmp/kuwala/osmFiles/parquet')
    continent = args.continent

    if continent is None:
        file_path = select_local_osm_file(directory)
    else:
        file_path = f'{directory}/{continent}'

        if args.country:
            file_path += f'/{args.country}'

        if args.country_region:
            file_path += f'/{args.country_region}'

    start_time = time.time()

    Neo4jConnection.connect_to_graph()
    add_constraints()
    add_poi_categories()
    Neo4jConnection.close_connection()

    spark = SparkSession.builder.appName('neo4j_importer_osm-poi').getOrCreate().newSession()
    df = spark.read.parquet(f'{file_path}/kuwala.parquet').sort('id')

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
