import functools

from database.schemas.data_source import ConnectionParameters
from fastapi import HTTPException
from google.cloud import bigquery
from google.oauth2 import service_account


def get_credentials(connection_parameters: ConnectionParameters):
    return service_account.Credentials.from_service_account_info(
        connection_parameters.credentials_json.dict()
    )


def test_connection(connection_parameters: ConnectionParameters) -> bool:
    credentials = get_credentials(connection_parameters=connection_parameters)

    # noinspection PyBroadException
    try:
        client = bigquery.Client(credentials=credentials)

        client.close()

        connected = True
    except Exception:
        connected = False

    return connected


def get_schema(connection_parameters: ConnectionParameters):
    credentials = get_credentials(connection_parameters=connection_parameters)
    client = bigquery.Client(credentials=credentials)
    schema = []
    projects = client.list_projects()

    for project in projects:
        project_schema = dict(project=project.project_id, datasets=[])
        datasets = client.list_datasets(project=project.project_id)

        for dataset in datasets:
            dataset_schema = dict(dataset=dataset.dataset_id, tables=[], views=[])
            tables = client.list_tables(dataset=dataset.dataset_id)

            for table in tables:
                if table.table_type == "TABLE":
                    dataset_schema["tables"].append(table.table_id)
                elif table.table_type == "VIEW":
                    dataset_schema["views"].append(table.table_id)

            project_schema["datasets"].append(dataset_schema)

        schema.append(project_schema)

    client.close()

    return schema


def get_columns(
    connection_parameters: ConnectionParameters,
    project_name: str,
    dataset_name: str,
    table_name: str,
):
    credentials = get_credentials(connection_parameters=connection_parameters)
    client = bigquery.Client(credentials=credentials)
    table_ref = f"{project_name}.{dataset_name}.{table_name}"
    table = client.get_table(table=table_ref)
    columns = list(
        map(lambda sf: dict(column=sf.name, type=sf.field_type.upper()), table.schema)
    )

    return columns


def get_table_preview(
    connection_parameters: ConnectionParameters,
    project_name: str,
    dataset_name: str,
    table_name: str,
    columns: list[str],
    limit_columns: int = 200,
    limit_rows: int = 300,
) -> dict:
    if not project_name:
        raise HTTPException(
            status_code=400, detail="Missing query parameter: 'project_name'"
        )

    if not dataset_name:
        raise HTTPException(
            status_code=400, detail="Missing query parameter: 'dataset_name'"
        )

    if not limit_columns:
        limit_columns = 200

    if not limit_rows:
        limit_rows = 300

    credentials = get_credentials(connection_parameters=connection_parameters)
    client = bigquery.Client(credentials=credentials)
    table_ref = f"{project_name}.{dataset_name}.{table_name}"

    if not columns:
        table = client.get_table(table=table_ref)
        columns = list(map(lambda s: s.name, table.schema))

    columns_string = functools.reduce(
        lambda c1, c2: f"{c1}, {c2}", columns[0:limit_columns]
    )
    rows_query = f"""
        SELECT {columns_string}
        FROM {table_ref}
        LIMIT {limit_rows}
    """
    query_job = client.query(rows_query)
    rows_iterator = query_job.result()
    rows = []

    for row in rows_iterator:
        rows.append(list(row))

    return dict(columns=columns, rows=rows)
