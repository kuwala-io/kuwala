from typing import Optional
from neo4j import GraphDatabase, Neo4jDriver

graph = None  # type: Optional[Neo4jDriver]


def connect_to_graph(uri, user, password):
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

    try:
        session = graph.session(database=db) if db is not None else graph.session()
        response = list(session.run(q, parameters))
    except Exception as e:
        print("Query failed:", e)
    finally:
        if session is not None:
            session.close()

    return response


# Method used inside Pyspark
# Establish new database connection for each invocation due to multi-threaded environment
def batch_insert_data(partition, query):
    def send_query(rows):
        query_graph(query, parameters={'rows': rows})
        print('Inserted batch')

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
