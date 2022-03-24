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
    dataset_name: str,
    table_name: str,
):
    credentials = get_credentials(connection_parameters=connection_parameters)
    client = bigquery.Client(credentials=credentials)
    table_ref = f"{credentials.project_id}.{dataset_name}.{table_name}"
    table = client.get_table(table=table_ref)
    columns = list(
        map(lambda sf: dict(column=sf.name, type=sf.field_type.upper()), table.schema)
    )

    return columns


def get_table_preview(
    connection_parameters: ConnectionParameters,
    dataset_name: str,
    table_name: str,
    columns: list[str],
    limit_columns: int = 200,
    limit_rows: int = 300,
) -> dict:
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
    table_ref = f"{credentials.project_id}.{dataset_name}.{table_name}"

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

    return dict(columns=columns[0:limit_columns], rows=rows)


def update_dbt_connection_parameters(
    profile_yaml: dict, connection_parameters: ConnectionParameters
) -> dict:
    credentials_json = connection_parameters.credentials_json
    dev_profile = profile_yaml["kuwala"]["outputs"]["dev"]
    dev_profile["dataset"] = "dbt_kuwala"
    dev_profile["project"] = connection_parameters.credentials_json.project_id
    dev_profile["method"] = "service-account-json"
    dev_profile["keyfile_json"] = dict(
        type=credentials_json.type,
        project_id=credentials_json.project_id,
        private_key_id=credentials_json.private_key_id,
        private_key=credentials_json.private_key,
        client_email=credentials_json.client_email,
        client_id=credentials_json.client_id,
        auth_uri=credentials_json.auth_uri,
        token_uri=credentials_json.token_uri,
        auth_provider_x509_cert_url=credentials_json.auth_provider_x509_cert_url,
        client_x509_cert_url=credentials_json.client_x509_cert_url,
    )

    return profile_yaml
