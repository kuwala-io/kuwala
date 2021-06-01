import json
import os
# noinspection PyUnresolvedReferences
from src.neo4j.Neo4jConnection import Neo4jConnection
from pyspark.sql import SparkSession
from pyspark.sql.functions import flatten


def connect_to_graph():
    return Neo4jConnection(uri="bolt://localhost:7687",
                           user="neo4j",
                           pwd="password")


def connect_to_mongo(database, collection):
    mongo_url = f'mongodb://127.0.0.1:27017/{database}.{collection}'

    return SparkSession \
        .builder \
        .appName('osmPoi') \
        .config('spark.mongodb.input.uri', mongo_url) \
        .config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector_2.12:3.0.1') \
        .getOrCreate()


def add_constraints(graph):
    graph.query('CREATE CONSTRAINT poiCategory IF NOT EXISTS ON (pc:PoiCategory) ASSERT pc.name IS UNIQUE')
    graph.query('CREATE CONSTRAINT h3Index IF NOT EXISTS ON (h:H3Index) ASSERT h.h3Index IS UNIQUE')
    graph.query('CREATE CONSTRAINT poiOsm IF NOT EXISTS ON (po:PoiOSM) ASSERT (po.osmId, po.type) IS NODE KEY')


def insert_data_to_graph(graph, query, columns):
    def send_query(rows):
        graph.query(query, parameters={'rows': rows})
        print('Inserted batch')

    batch = 0
    batch_size = 10000
    pandas_df = columns.toPandas()

    while batch * batch_size < len(pandas_df):
        send_query(pandas_df[batch * batch_size:(batch + 1) * batch_size].to_dict('records'))
        batch += 1


def add_h3_indexes(graph, df):
    query = '''
            UNWIND $rows AS row
            MERGE (:H3Index { h3Index: row.h3Index })
            '''

    insert_data_to_graph(graph, query, df)


def add_poi_categories(graph):
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, '../../resources/poiCategories.json')

    with open(file_path, 'r') as json_file:
        categories = list(json.load(json_file).values())
        query = '''
                UNWIND $rows AS row
                MERGE (:PoiCategory { name: row.category })
                '''

        graph.query(query, parameters={'rows': categories})


def add_osm_pois(graph, df):
    query = '''
        // Create PoiOSM nodes
        UNWIND $rows AS row
        MERGE (po:PoiOSM { osmId: row.osmId, type: row.type })
        SET po.name = row.name, po.osmTags = row.osmTags
        
        // Create H3 index nodes
        WITH row, po
        MATCH (h:H3Index {h3Index: row.h3Index})
        MERGE (po)-[:LOCATED_AT]->(h)
        
        // Create relationship to PoiCategories
        WITH row, po
        MATCH (pc:PoiCategory) 
        WHERE pc.name IN row.categories
        MERGE (po)-[:BELONGS_TO]->(pc)
    '''

    insert_data_to_graph(graph, query, df)


def add_osm_poi_addresses(graph, df):
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

    df = df \
        .withColumn('houseNr', df.address.houseNr) \
        .withColumn('houseName', df.address.houseName) \
        .withColumn('block', df.address.block) \
        .withColumn('street', df.address.street) \
        .withColumn('place', df.address.place) \
        .withColumn('zipCode', df.address.zipCode) \
        .withColumn('city', df.address.city) \
        .withColumn('country', df.address.country) \
        .withColumn('full', df.address.full) \
        .withColumn('neighborhood', df.address.region.neighborhood) \
        .withColumn('suburb', df.address.region.suburb) \
        .withColumn('district', df.address.region.district) \
        .withColumn('province', df.address.region.province) \
        .withColumn('state', df.address.region.state) \
        .withColumn('level', df.address.details.level) \
        .withColumn('flats', df.address.details.flats) \
        .withColumn('unit', df.address.details.unit) \
        .drop('address')

    insert_data_to_graph(graph, query, df)


def import_data_from_mongo(database, collection):
    limit = 25
    graph = connect_to_graph()
    spark = connect_to_mongo(database, collection)
    df = spark.read.format('com.mongodb.spark.sql.DefaultSource').load()
    df = df.withColumn('osmId', df['osmId'].cast('Integer')).withColumn('osmTags', flatten('osmTags'))

    add_constraints(graph)
    add_poi_categories(graph)
    add_h3_indexes(graph, df.select('h3Index').limit(limit))
    add_osm_pois(graph, df.select(
        'osmId',
        'type',
        'name',
        'osmTags',
        'h3Index',
        'categories'
    ).limit(limit))
    add_osm_poi_addresses(graph, df.filter(df.address.isNotNull()).select('osmId', 'type', 'address').limit(limit))

    spark.stop()
