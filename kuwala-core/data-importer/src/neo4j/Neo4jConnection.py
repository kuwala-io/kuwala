from typing import Optional
from neo4j import GraphDatabase, Neo4jDriver

graph = None  # type: Optional[Neo4jDriver]


def connect_to_graph(uri, user, password):
    try:
        global graph
        graph = GraphDatabase.driver(uri, auth=(user, password))
    except Exception as e:
        print('Failed to create the driver: ', e)


def close():
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
