import controller.data_source.bigquery as bigquery_controller
import controller.data_source.postgres as postgres_controller
import database.crud.data_source as crud_data_source
from database.database import get_db
import database.models.data_source as models
from database.schemas.data_source import ConnectionParameters
from database.utils.encoder import list_of_dicts_to_dict
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session


def get_data_source_and_data_catalog_item_id(
    data_source_id: str,
    db: Session = Depends(get_db),
) -> tuple[models.DataSource, str]:
    data_source = crud_data_source.get_data_source(db=db, data_source_id=data_source_id)
    data_catalog_item_id = data_source.data_catalog_item_id

    if not data_source:
        raise HTTPException(
            status_code=404, detail=f"No data source found with ID {data_source_id}."
        )

    if not data_catalog_item_id or (
        data_catalog_item_id != "postgres" and data_catalog_item_id != "bigquery"
    ):
        raise HTTPException(
            status_code=404,
            detail=f"No matching data catalog item found for data source {data_catalog_item_id}",
        )

    return data_source, data_catalog_item_id


def get_connection_parameters(data_source: models.DataSource) -> ConnectionParameters:
    connection_parameters_dict = list_of_dicts_to_dict(
        list_of_dicts=data_source.connection_parameters, key="id", value="value"
    )

    return ConnectionParameters.parse_obj(connection_parameters_dict)


def test_connection(
    data_source_id: str,
    connection_parameters: ConnectionParameters,
    db: Session = Depends(get_db),
) -> bool:
    connected = False
    data_source, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        data_source_id=data_source_id, db=db
    )

    if data_catalog_item_id == "postgres":
        connected = postgres_controller.test_connection(
            connection_parameters=connection_parameters
        )
    elif data_catalog_item_id == "bigquery":
        connected = bigquery_controller.test_connection(
            connection_parameters=connection_parameters
        )

    if not connected:
        return False

    return True


def get_schema(data_source_id: str, db: Session = Depends(get_db)):
    data_source, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        db=db, data_source_id=data_source_id
    )
    connection_parameters = get_connection_parameters(data_source)
    schema = None

    if data_catalog_item_id == "postgres":
        schema = postgres_controller.get_schema(
            connection_parameters=connection_parameters
        )
    elif data_catalog_item_id == "bigquery":
        schema = bigquery_controller.get_schema(
            connection_parameters=connection_parameters
        )

    return schema


def get_table_preview(
    data_source_id: str,
    schema_name: str,
    table_name: str,
    limit_columns: int,
    limit_rows: int,
    db: Session = Depends(get_db),
):
    data_source, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        db=db, data_source_id=data_source_id
    )
    connection_parameters = get_connection_parameters(data_source)
    data = None

    if data_catalog_item_id == "postgres":
        data = postgres_controller.get_table_preview(
            connection_parameters=connection_parameters,
            schema_name=schema_name,
            table_name=table_name,
            limit_columns=limit_columns,
            limit_rows=limit_rows,
        )

    return data
