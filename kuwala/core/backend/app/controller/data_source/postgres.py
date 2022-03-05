from database.schemas.data_source import ConnectionParameters
from fastapi import HTTPException
import psycopg2


def test_connection(connection_parameters: ConnectionParameters) -> bool:
    host = connection_parameters.host
    port = connection_parameters.port
    user = connection_parameters.user
    password = connection_parameters.password
    database = connection_parameters.database

    if not (host and port and user and password and database):
        raise HTTPException(
            status_code=400, detail="Not all required connection parameters are set."
        )

    try:
        connection = psycopg2.connect(
            host=host, port=port, user=user, password=password, database=database
        )

        connection.close()
    except psycopg2.OperationalError:
        return False

    return True
