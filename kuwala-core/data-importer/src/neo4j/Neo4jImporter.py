# noinspection PyUnresolvedReferences
from src.neo4j.Neo4jConnection import Neo4jConnection
from pyspark.sql import SparkSession


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
    graph.query('CREATE CONSTRAINT poiOsm IF NOT EXISTS ON (p:PoiOSM) ASSERT (p.osmId, p.type) IS NODE KEY')
    graph.query('CREATE CONSTRAINT h3Index IF NOT EXISTS ON (h:H3Index) ASSERT h.h3Index IS UNIQUE')


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

    return insert_data_to_graph(graph, query, df)


def add_osm_pois(graph, df):
    query = '''
            UNWIND $rows AS row
            MERGE (p:PoiOSM { osmId: row.osmId, type: row.type })
            WITH row, p
            MATCH (h:H3Index {h3Index: row.h3Index})
            MERGE (p)-[:LOCATED_AT]->(h)
            '''

    return insert_data_to_graph(graph, query, df)


def import_data_from_mongo(database, collection):
    graph = connect_to_graph()
    spark = connect_to_mongo(database, collection)
    df = spark.read.format('com.mongodb.spark.sql.DefaultSource').load()

    add_constraints(graph)
    add_h3_indexes(graph, df.select('h3Index'))
    add_osm_pois(graph, df.select('osmId', 'type', 'h3Index'))

    spark.stop()
