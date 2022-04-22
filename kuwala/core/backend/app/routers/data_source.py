from typing import Optional

import controller.data_block_controller as data_block_controller
import controller.data_source.data_source as data_source_controller
from database.crud.common import get_all_objects
from database.crud.data_source import update_connection_parameters
from database.database import get_db
import database.models.data_source as models
from database.schemas.data_source import (
    ConnectionParameters,
    DataSource,
    DataSourceConnection,
)
from database.utils.encoder import list_props_to_json_props
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/data-source",
    tags=["data_source"],
)


@router.get("/", response_model=list[DataSource])
def get_all_data_sources(db: Session = Depends(get_db)):
    data_sources = get_all_objects(db=db, model=models.DataSource)
    data_sources = list(
        map(
            lambda data_source: list_props_to_json_props(
                base_object=data_source, list_parameters=["connection_parameters"]
            ),
            data_sources,
        )
    )

    return data_sources


@router.post("/{data_source_id}/connection/test")
def test_connection(
    data_source_id: str,
    connection_parameters: ConnectionParameters,
    db: Session = Depends(get_db),
):
    return dict(
        connected=data_source_controller.test_connection(
            data_source_id=data_source_id,
            connection_parameters=connection_parameters,
            db=db,
        )
    )


@router.put("/{data_source_id}/connection")
def save_connection(
    data_source_id: str,
    connection_parameters: ConnectionParameters,
    db: Session = Depends(get_db),
):
    data_source_updated_connection = DataSourceConnection(
        id=data_source_id, connection_parameters=connection_parameters.json()
    )
    data_source = update_connection_parameters(
        db=db, data_source_updated_connection=data_source_updated_connection
    )
    data_catalog_item_id = data_source.data_catalog_item_id

    if (
        data_catalog_item_id == "postgres"
        or data_catalog_item_id == "bigquery"
        or data_catalog_item_id == "snowflake"
    ):
        data_source_controller.update_dbt_connection_parameters(
            data_source=data_source, connection_parameters=connection_parameters
        )

    return data_source


@router.get("/{data_source_id}/schema")
def get_data_source_schema(data_source_id: str, db: Session = Depends(get_db)):
    return data_source_controller.get_schema(data_source_id=data_source_id, db=db)


@router.get("/{data_source_id}/table/columns")
def get_data_source_table_columns(
    data_source_id: str,
    table_name: str,
    schema_name: str = None,
    dataset_name: str = None,
    db: Session = Depends(get_db),
):
    return data_source_controller.get_columns(
        data_source_id=data_source_id,
        table_name=table_name,
        schema_name=schema_name,
        dataset_name=dataset_name,
        db=db,
    )


@router.get("/{data_source_id}/table/preview")
def get_table_preview(
    data_source_id: str,
    table_name: str,
    schema_name: str = None,
    dataset_name: str = None,
    columns: Optional[list[str]] = Query(None),
    limit_columns: int = None,
    limit_rows: int = None,
    db: Session = Depends(get_db),
):
    return data_source_controller.get_table_preview(
        data_source_id=data_source_id,
        schema_name=schema_name,
        dataset_name=dataset_name,
        table_name=table_name,
        columns=columns,
        limit_columns=limit_columns,
        limit_rows=limit_rows,
        db=db,
    )


@router.put("/{data_source_id}/{schema_name}/sources/refresh")
def refresh_sources(data_source_id: str, schema_name: str):
    return data_block_controller.refresh_sources(
        data_source_id=data_source_id, schema_name=schema_name
    )
