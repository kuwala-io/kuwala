import functools
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


def send_query(
    connection_parameters: ConnectionParameters,
    query: str = None,
    path_to_query_file: str = None,
) -> list:
    connection = get_connection(connection_parameters=connection_parameters)
    cursor = connection.cursor()

    if path_to_query_file:
        with open(path_to_query_file, "r") as f:
            query = f.read()

            f.close()

    cursor.execute(query)

    result = cursor.fetchall()
    header = tuple([desc[0] for desc in cursor.description])
    result = [header] + result

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


def get_keys(
    table_name: str, key_type: str, connection_parameters: ConnectionParameters
):
    query = f"""
        SELECT c.column_name
        FROM information_schema.key_column_usage AS c
        LEFT JOIN information_schema.table_constraints AS t
        ON t.constraint_name = c.constraint_name
        WHERE t.table_name = '{table_name}' AND t.constraint_type = '{key_type} KEY';
    """

    return list(
        dict.fromkeys(
            list(
                map(
                    lambda k: k[0],
                    send_query(
                        connection_parameters=connection_parameters,
                        query=query,
                    )[1:],
                )
            )
        )
    )


def get_table_preview(
    connection_parameters: ConnectionParameters,
    schema_name: str,
    table_name: str,
    limit_columns: int,
    limit_rows: int,
) -> dict:
    if not limit_columns:
        limit_columns = 200

    if not limit_rows:
        limit_rows = 300

    columns_query = f"""
        SELECT *
        FROM {schema_name}.{table_name}
        LIMIT 0
    """
    columns = send_query(
        connection_parameters=connection_parameters, query=columns_query
    )
    columns_string = functools.reduce(
        lambda c1, c2: f"{c1}, {c2}", columns[0][0:limit_columns]
    )
    rows_query = f"""
        SELECT {columns_string}
        FROM {schema_name}.{table_name}
        LIMIT {limit_rows}
    """
    rows = send_query(connection_parameters=connection_parameters, query=rows_query)
    columns = rows.pop(0)
    primary_keys = get_keys(
        table_name=table_name,
        key_type="PRIMARY",
        connection_parameters=connection_parameters,
    )
    foreign_keys = get_keys(
        table_name=table_name,
        key_type="FOREIGN",
        connection_parameters=connection_parameters,
    )

    return dict(
        columns=columns, primary_keys=primary_keys, foreign_keys=foreign_keys, rows=rows
    )
