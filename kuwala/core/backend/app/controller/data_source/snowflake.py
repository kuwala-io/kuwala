import csv
import functools

from database.schemas.data_source import ConnectionParameters
from database.utils.delimiter import get_delimiter_by_id
from fastapi import HTTPException
import snowflake.connector


def map_connection_parameters(connection_parameters: ConnectionParameters):
    user = connection_parameters.user
    password = connection_parameters.password
    account = connection_parameters.organization + "-" + connection_parameters.account
    database = connection_parameters.database
    warehouse = connection_parameters.warehouse
    role = connection_parameters.role

    if not (user and password and account and database and warehouse and role):
        raise HTTPException(
            status_code=400, detail="Not all required connection parameters are set."
        )

    return user, password, account, database, warehouse, role


def get_connection(connection_parameters: ConnectionParameters):
    user, password, account, database, warehouse, role = map_connection_parameters(
        connection_parameters=connection_parameters
    )

    return snowflake.connector.connect(
        user=user,
        password=password,
        account=account,
        database=database,
        warehouse=warehouse,
        role=role,
        login_timeout=10,
    )


def send_query(
    connection_parameters: ConnectionParameters,
    query: str = None,
) -> list:
    connection = get_connection(connection_parameters=connection_parameters)
    cursor = connection.cursor()

    cursor.execute(query)

    result = cursor.fetchall()
    header = tuple([desc[0] for desc in cursor.description])
    result = [header] + result

    cursor.close()
    connection.close()

    return result


def save_query(
    connection_parameters: ConnectionParameters,
    delimiter_id: str,
    query: str = None,
    destination_file: str = None,
) -> list:
    connection = get_connection(connection_parameters=connection_parameters)
    cursor = connection.cursor()

    cursor.execute(query)

    rows = cursor.fetchall()

    column_names = [i[0] for i in cursor.description]
    fp = open(destination_file, "w+")
    delimiter = get_delimiter_by_id(delimiter_id=delimiter_id)
    myFile = csv.writer(fp, lineterminator="\n", delimiter=delimiter)
    myFile.writerow(column_names)
    myFile.writerows(rows)
    fp.close()

    cursor.close()
    connection.close()

    return True


def test_connection(connection_parameters: ConnectionParameters) -> bool:
    try:
        connection = get_connection(connection_parameters=connection_parameters)

        connection.close()
    except Exception:
        return False

    return True


def get_schema(connection_parameters: ConnectionParameters):
    connection = get_connection(connection_parameters=connection_parameters)

    cursor = connection.cursor()
    schemas, tables, views = [], [], []

    try:
        query = "SHOW SCHEMAS"
        cursor.execute(query)

        for schema in cursor.fetchall():
            schemas.append(dict(schema=schema[1], categories=[]))

        for i in range(len(schemas)):
            query = f"SHOW TABLES in {schemas[i]['schema']}"
            cursor.execute(query)
            for table in cursor.fetchall():
                tables.append(table[1])

            if tables:
                schemas[i]["categories"].append(dict(category="tables", tables=tables))
                tables = []

            query = f"SHOW VIEWS in {schemas[i]['schema']}"
            cursor.execute(query)

            for view in cursor.fetchall():
                views.append(view[1])

            if views:
                schemas[i]["categories"].append(dict(category="views", tables=views))
                views = []

    finally:
        cursor.close()

    connection.close()

    return schemas


def get_columns(
    connection_parameters: ConnectionParameters, schema_name: str, table_name: str
):
    columns_query = f"""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = '{schema_name.upper()}' AND table_name = '{table_name.upper()}'
    """
    columns = send_query(
        connection_parameters=connection_parameters, query=columns_query
    )[1:]
    columns = list(map(lambda c: dict(column=c[0], type=c[1].upper()), columns))

    return columns


def get_table_preview(
    connection_parameters: ConnectionParameters,
    schema_name: str,
    table_name: str,
    columns: list[str],
    limit_columns: int,
    limit_rows: int,
) -> dict:
    if not schema_name:
        raise HTTPException(
            status_code=400, detail="Missing query parameter: 'schema_name'"
        )

    if not limit_columns:
        limit_columns = 200

    if not limit_rows:
        limit_rows = 300

    if not columns:
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
    else:
        columns_string = functools.reduce(
            lambda c1, c2: f"{c1}, {c2}", columns[0:limit_columns]
        )

    rows_query = f"""
        SELECT {columns_string}
        FROM {schema_name}.{table_name}
        LIMIT {limit_rows}
    """
    rows = send_query(connection_parameters=connection_parameters, query=rows_query)
    columns = rows.pop(0)

    return dict(columns=columns, rows=rows)


def save_result(
    connection_parameters: ConnectionParameters,
    schema_name: str,
    table_name: str,
    columns: list[str],
    result_dir: str,
    delimiter_id: str,
):
    if not schema_name:
        raise HTTPException(
            status_code=400, detail="Missing query parameter: 'schema_name'"
        )

    if not columns:
        columns_query = f"""
            SELECT *
            FROM {schema_name}.{table_name}
            LIMIT 0
        """
        columns = send_query(
            connection_parameters=connection_parameters, query=columns_query
        )

        columns_string = functools.reduce(lambda c1, c2: f"{c1}, {c2}", columns[0][0:])
    else:
        columns_string = functools.reduce(lambda c1, c2: f"{c1}, {c2}", columns[0:])

    rows_query = f"""
        SELECT {columns_string}
        FROM {schema_name}.{table_name}
    """

    save_query(
        connection_parameters=connection_parameters,
        destination_file=result_dir,
        query=rows_query,
        delimiter_id=delimiter_id,
    )

    return None


def update_dbt_connection_parameters(
    profile_yaml: dict, connection_parameters: ConnectionParameters
) -> dict:
    dev_profile = profile_yaml["kuwala"]["outputs"]["dev"]
    dev_profile["user"] = connection_parameters.user
    dev_profile["password"] = connection_parameters.password
    dev_profile["account"] = (
        connection_parameters.organization + "-" + connection_parameters.account
    )
    dev_profile["database"] = connection_parameters.database
    dev_profile["schema"] = "dbt_kuwala"
    dev_profile["warehouse"] = connection_parameters.warehouse
    dev_profile["role"] = connection_parameters.role

    return profile_yaml
