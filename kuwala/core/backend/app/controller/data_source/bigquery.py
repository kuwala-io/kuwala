import json
import os

from database.schemas.data_source import ConnectionParameters
from google.cloud import bigquery


def test_connection(connection_parameters: ConnectionParameters) -> bool:
    script_dir = os.path.dirname(__file__)
    json_credentials_path = os.path.join(
        script_dir,
        "../../tmp/controller/data_source/bigquery_credentials.json",
    )

    with open(json_credentials_path, "w") as f:
        json.dump(connection_parameters.credentials_json.dict(), f, indent=4)

    # noinspection PyBroadException
    try:
        client = bigquery.Client.from_service_account_json(
            json_credentials_path=json_credentials_path
        )

        client.close()

        connected = True
    except Exception:
        connected = False

    os.remove(json_credentials_path)

    return connected
