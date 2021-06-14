import h3
import Neo4jConnection as Neo4jConnection
import PipelineImporter as PipelineImporter
from pyspark.sql.functions import lit


#  Sets uniqueness constraint for population values
def add_constraints():
    Neo4jConnection.connect_to_graph()
    
    Neo4jConnection.query_graph(
        'CREATE CONSTRAINT population IF NOT EXISTS ON (p:Population) ASSERT p.value IS UNIQUE')

    Neo4jConnection.close_connection()


def add_cells(df):
    query = '''
        UNWIND $rows AS row 
        MERGE (h:H3Index { h3Index: row.h3Index })
        ON CREATE SET h.resolution = row.resolution
        MERGE (pt:Population { value: row.total_population })
        MERGE (pw:Population { value: row.women })
        MERGE (pm:Population { value: row.men })
        MERGE (pc:Population { value: row.children_under_five })
        MERGE (py:Population { value: row.youth_15_24} )
        MERGE (pe:Population { value: row.elderly_60_plus })
        MERGE (pwr:Population { value: row.women_of_reproductive_age_15_49 })
        MERGE (pt)-[:POPULATION_AT { type: "total_population" }]->(h)
        MERGE (pw)-[:POPULATION_AT { type: "women" }]->(h)
        MERGE (pm)-[:POPULATION_AT { type: "men" }]->(h)
        MERGE (pc)-[:POPULATION_AT { type: "children_under_five" }]->(h)
        MERGE (py)-[:POPULATION_AT { type: "youth_15_24" }]->(h)
        MERGE (pe)-[:POPULATION_AT { type: "elderly_60_plus" }]->(h)
        MERGE (pwr)-[:POPULATION_AT { type: "women_of_reproductive_age_15_49" }]->(h)
    '''

    df.foreachPartition(lambda partition: Neo4jConnection.batch_insert_data(partition, query))


def import_population_density(limit=None):
    spark = PipelineImporter.connect_to_mongo('population', 'cells')
    df = spark.read.format('com.mongodb.spark.sql.DefaultSource').load().withColumnRenamed('_id', 'h3Index')
    
    # noinspection PyUnresolvedReferences
    resolution = h3.h3_get_resolution(df.first()['h3Index'])
    cells = df.select('h3Index', 'population.*').withColumn('resolution', lit(resolution))

    if limit is not None:
        cells = cells.limit(limit)

    add_constraints()
    add_cells(cells)

