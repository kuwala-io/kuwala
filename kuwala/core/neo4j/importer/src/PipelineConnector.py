import Neo4jConnection as Neo4jConnection
from pyspark.sql import DataFrame
from pyspark.sql.functions import concat
from pyspark.sql.types import LongType


# Create relationships from high resolution H3 indexes to lower resolution H3 indexes
def connect_h3_indexes():
    Neo4jConnection.connect_to_graph()

    query_resolutions = '''
        MATCH (h:H3Index)
        WITH DISTINCT h.resolution AS resolutions
        ORDER BY resolutions DESC
        RETURN resolutions
    '''
    resolutions = Neo4jConnection.query_graph(query_resolutions)
    resolutions = resolutions[0]  # Query returns a tuple with the results at the first index
    resolutions = [i for i in resolutions if i[0] is not None]

    # Find parents of children and connect them
    for i, r in enumerate(resolutions):
        if i < len(resolutions) - 1:
            query_connect_to_parent = f'''
                MATCH (h1:H3Index)
                WHERE h1.resolution = {r[0]} 
                MATCH (h2:H3Index)
                WHERE h2.h3Index = io.kuwala.h3.h3ToParent(h1.h3Index, {resolutions[i + 1][0]})
                MERGE (h1)-[:CHILD_OF]->(h2)
            '''

            Neo4jConnection.query_graph(query_connect_to_parent)

    Neo4jConnection.close_connection()


# Create one single POI node combining OSM and Google
def connect_pois(df_osm: DataFrame, df_google: DataFrame):
    df_osm = df_osm.select('id', 'h3Index').withColumnRenamed('h3Index', 'h3IndexOsm').withColumnRenamed('id', 'osmId')
    df_google = df_google \
        .withColumn('osmId', df_google['osmId'].cast(LongType())) \
        .withColumn('osmId', concat('type', 'osmId')) \
        .select('id', 'osmId', 'confidence', 'h3Index') \
        .withColumnRenamed('id', 'googleId') \
        .withColumnRenamed('h3Index', 'h3IndexGoogle')
    df_pois = df_osm.join(df_google, on=['osmId'], how='left')

    Neo4jConnection.connect_to_graph()
    Neo4jConnection.query_graph('CREATE CONSTRAINT poi IF NOT EXISTS ON (p:Poi) ASSERT p.id IS UNIQUE')

    query = '''
        // Create Poi nodes
        UNWIND $rows AS row
        WITH 
            CASE WHEN row.confidence >= 0.9 
                THEN row.h3IndexGoogle + '_' + row.osmId 
                ELSE row.h3IndexOsm + '_' + row.osmId 
                END AS id,
            row
        MERGE (p:Poi { id: id })
        WITH p, row
        MATCH (po:PoiOSM { id: row.osmId })
        MERGE (po)-[:BELONGS_TO]->(p)
        WITH CASE WHEN row.confidence >= 0.9 THEN row.h3IndexGoogle ELSE row.h3IndexOsm END as h3Index, p, row
        MATCH (h:H3Index { h3Index: h3Index })
        MERGE (p)-[:LOCATED_AT]->(h)
        WITH p, row
        MATCH (pg:PoiGoogle { id: row.googleId })
        MERGE (pg)-[:BELONGS_TO { confidence: row.confidence }]->(p)
    '''

    df_pois.foreachPartition(lambda p: Neo4jConnection.batch_insert_data(p, query))
