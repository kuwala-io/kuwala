import os

from neo4j import exceptions, GraphDatabase, Neo4jDriver
from time import sleep
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


# Method used inside Pyspark
# Establish new database connection for each invocation due to multi-threaded environment
def batch_insert_data(partition, query):
    def send_query(rows):
        sleep_time = 1

        while True:
            response, retry = query_graph(query, parameters={'rows': rows})

            if not retry:
                break
            elif sleep_time < 60:
                sleep(sleep_time)
                sleep_time *= 2
            else:
                return response

    connect_to_graph(uri="bolt://localhost:7687",
                     user="neo4j",
                     password="password")

    batch = list()
    batch_size = 10000

    for row in partition:
        batch.append(row.asDict())

        if len(batch) == batch_size:
            send_query(batch)

            batch = list()

    if len(batch) > 0:
        send_query(batch)

    close_connection()
