import os

from database.schemas.data_source import ConnectionParameters
from fastapi import HTTPException
import psycopg2


def map_connection_parameters(connection_parameters: ConnectionParameters):
    host = connection_parameters.host
    port = connection_parameters.port
    user = connection_parameters.user
    password = connection_parameters.password
    database = connection_parameters.database

    if not (host and port and user and password and database):
        raise HTTPException(
            status_code=400, detail="Not all required connection parameters are set."
        )

    return host, port, user, password, database


def get_connection(connection_parameters: ConnectionParameters):
    host, port, user, password, database = map_connection_parameters(
        connection_parameters=connection_parameters
    )

    return psycopg2.connect(
        host=host, port=port, user=user, password=password, database=database
    )


def send_query(connection_parameters: ConnectionParameters, path_to_query_file):
    connection = get_connection(connection_parameters=connection_parameters)
    cursor = connection.cursor()

    with open(path_to_query_file, "r") as f:
        query = f.read()

        f.close()

    cursor.execute(query)

    result = cursor.fetchall()

    cursor.close()
    connection.close()

    return result


def test_connection(connection_parameters: ConnectionParameters) -> bool:
    try:
        connection = get_connection(connection_parameters=connection_parameters)

        connection.close()
    except psycopg2.OperationalError:
        return False

    return True


def get_schema(connection_parameters: ConnectionParameters):
    script_dir = os.path.dirname(__file__)
    path_to_query_file = os.path.join(
        script_dir, "../../resources/data_sources/postgres_database_structure.sql"
    )
    tables = send_query(
        connection_parameters=connection_parameters,
        path_to_query_file=path_to_query_file,
    )
    schemas = []

    for table in tables:
        schema_index = next(
            (index for (index, s) in enumerate(schemas) if s["schema"] == table[0]), -1
        )

        if schema_index < 0:
            schemas.append(
                dict(
                    schema=table[0],
                    categories=[dict(category=table[1], tables=[table[2]])],
                )
            )
        else:
            category_index = next(
                (
                    index
                    for (index, c) in enumerate(schemas[schema_index]["categories"])
                    if c["category"] == table[1]
                ),
                -1,
            )

            if category_index < 0:
                schemas[schema_index]["categories"].append(
                    dict(category=table[1], tables=[table[2]])
                )
            else:
                schemas[schema_index]["categories"][category_index]["tables"].append(
                    table[2]
                )

    return schemas
