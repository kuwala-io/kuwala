from database.schemas.data_source import ConnectionParameters
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
