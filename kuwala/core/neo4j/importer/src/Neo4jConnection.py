import os
from neo4j import exceptions, GraphDatabase, Neo4jDriver
from typing import Optional

graph = None  # type: Optional[Neo4jDriver]


def connect_to_graph(uri="bolt://localhost:7687", user="neo4j", password="password"):
    uri = os.getenv('NEO4J_HOST') or uri
    
    try:
        global graph
        graph = GraphDatabase.driver(uri, auth=(user, password))
    except Exception as e:
        print('Failed to create the driver: ', e)


def close_connection():
    if graph is not None:
        graph.close()


def query_graph(q, parameters=None, db=None):
    assert graph is not None, "Driver not initialized!"

    session = None
    response = None
    retry = False

    try:
        session = graph.session(database=db) if db is not None else graph.session()
        response = list(session.run(q, parameters))
    # Deadlocks might occur due to concurrent writes
    except exceptions.TransientError:
        print('Retry')

        retry = True
    except Exception as e:
        print("Query failed:", e)
    finally:
        if session is not None:
            session.close()

    return response, retry


def write_df_to_neo4j_with_override(df, query):
    url = os.getenv('NEO4J_HOST') or 'bolt://localhost:7687'

    # An error like this will be printed:
    #
    #   ERROR SchemaService: Query not compiled because of the following exception:
    #   org.neo4j.driver.exceptions.ClientException: Variable `event` not defined (line 3, column 32 (offset: 97))
    #   "MERGE (po:PoiOSM { id: event.id })"
    #
    # The error can be ignored and everything runs correctly as discussed here:
    # https://github.com/neo4j-contrib/neo4j-spark-connector/issues/357
    # The issue is fixed but not available for the PySpark packages yet:
    # https://spark-packages.org/package/neo4j-contrib/neo4j-connector-apache-spark_2.12

    df.write \
        .format('org.neo4j.spark.DataSource') \
        .mode('Overwrite') \
        .option('url', url) \
        .option('authentication.type', 'basic') \
        .option('authentication.basic.username', 'neo4j') \
        .option('authentication.basic.password', 'password') \
        .option('query', query) \
        .save()
