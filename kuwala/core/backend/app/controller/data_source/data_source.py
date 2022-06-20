import logging
import os
from typing import Optional

import controller.data_source.bigquery as bigquery_controller
import controller.data_source.postgres as postgres_controller
import controller.data_source.snowflake as snowflake_controller
from database.crud.common import get_object_by_id
import database.models.data_source as models
from database.schemas.data_source import ConnectionParameters
from database.utils.encoder import list_of_dicts_to_dict
from fastapi import HTTPException
import oyaml as yaml
import psycopg2.errors
from sqlalchemy.orm import Session


def get_controller(data_catalog_item_id: str):
    controller = None

    if data_catalog_item_id == "bigquery":
        controller = bigquery_controller
    elif data_catalog_item_id == "postgres":
        controller = postgres_controller
    elif data_catalog_item_id == "snowflake":
        controller = snowflake_controller

    if not controller:
        raise HTTPException(
            status_code=404,
            detail=f"Could not find controller for data catalog item {data_catalog_item_id}",
        )

    return controller


def get_data_source_and_data_catalog_item_id(
    data_source_id: str,
    db: Session,
) -> tuple[models.DataSource, str]:
    data_catalog_items = ["bigquery", "postgres", "snowflake"]
    data_source = get_object_by_id(
        db=db, model=models.DataSource, object_id=data_source_id
    )
    data_catalog_item_id = data_source.data_catalog_item_id

    if not data_source:
        raise HTTPException(
            status_code=404, detail=f"No data source found with ID {data_source_id}."
        )

    if data_catalog_item_id not in data_catalog_items:
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
    db: Session,
) -> bool:
    data_source, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        data_source_id=data_source_id, db=db
    )
    controller = get_controller(data_catalog_item_id=data_catalog_item_id)

    return controller.test_connection(connection_parameters=connection_parameters)


def get_schema(data_source_id: str, db: Session):
    data_source, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        db=db, data_source_id=data_source_id
    )
    connection_parameters = get_connection_parameters(data_source)
    controller = get_controller(data_catalog_item_id=data_catalog_item_id)

    return controller.get_schema(connection_parameters=connection_parameters)


def get_columns(
    data_source_id: str,
    schema_name: str,
    dataset_name: str,
    table_name: str,
    db: Session,
):
    columns = None
    data_source, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        db=db, data_source_id=data_source_id
    )
    connection_parameters = get_connection_parameters(data_source)

    if data_catalog_item_id == "postgres":
        columns = postgres_controller.get_columns(
            connection_parameters=connection_parameters,
            schema_name=schema_name,
            table_name=table_name,
        )
    elif data_catalog_item_id == "bigquery":
        columns = bigquery_controller.get_columns(
            connection_parameters=connection_parameters,
            dataset_name=dataset_name,
            table_name=table_name,
        )
    elif data_catalog_item_id == "snowflake":
        columns = snowflake_controller.get_columns(
            connection_parameters=connection_parameters,
            schema_name=schema_name,
            table_name=table_name,
        )
    return columns


def get_table_preview(
    data_source_id: str,
    schema_name: str,
    dataset_name: str,
    table_name: str,
    columns: Optional[list[str]],
    limit_columns: int,
    limit_rows: int,
    db: Session,
):
    data_source, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        db=db, data_source_id=data_source_id
    )
    connection_parameters = get_connection_parameters(data_source)
    data = None

    try:
        if data_catalog_item_id == "postgres":
            data = postgres_controller.get_table_preview(
                connection_parameters=connection_parameters,
                schema_name=schema_name,
                table_name=table_name,
                columns=columns,
                limit_columns=limit_columns,
                limit_rows=limit_rows,
            )
        elif data_catalog_item_id == "bigquery":
            data = bigquery_controller.get_table_preview(
                connection_parameters=connection_parameters,
                dataset_name=dataset_name,
                table_name=table_name,
                columns=columns,
                limit_columns=limit_columns,
                limit_rows=limit_rows,
            )
        elif data_catalog_item_id == "snowflake":
            data = snowflake_controller.get_table_preview(
                connection_parameters=connection_parameters,
                schema_name=schema_name,
                table_name=table_name,
                columns=columns,
                limit_columns=limit_columns,
                limit_rows=limit_rows,
            )
    except psycopg2.errors.UndefinedTable:
        pass
    except Exception as e:
        logging.error(e)

    return data


def save_as_csv(
    data_source_id: str,
    schema_name: str,
    dataset_name: str,
    table_name: str,
    columns: Optional[list[str]],
    result_dir: str,
    delimiter_id: str,
    db: Session,
):
    data_source, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        db=db, data_source_id=data_source_id
    )
    connection_parameters = get_connection_parameters(data_source)

    try:
        if data_catalog_item_id == "postgres":
            postgres_controller.save_result(
                connection_parameters=connection_parameters,
                schema_name=schema_name,
                table_name=table_name,
                columns=columns,
                result_dir=result_dir,
                delimiter_id=delimiter_id,
            )
        elif data_catalog_item_id == "bigquery":
            bigquery_controller.save_result(
                connection_parameters=connection_parameters,
                dataset_name=dataset_name,
                table_name=table_name,
                columns=columns,
                result_dir=result_dir,
                delimiter_id=delimiter_id,
            )
        elif data_catalog_item_id == "snowflake":
            snowflake_controller.save_result(
                connection_parameters=connection_parameters,
                schema_name=schema_name,
                table_name=table_name,
                columns=columns,
                result_dir=result_dir,
                delimiter_id=delimiter_id,
            )
    except psycopg2.errors.UndefinedTable:
        pass
    except Exception as e:
        logging.error(e)

    return None


def update_dbt_connection_parameters(
    data_source: models.DataSource, connection_parameters: ConnectionParameters
):
    script_dir = os.path.dirname(__file__)
    profile_path = os.path.join(
        script_dir,
        f"../../../../../tmp/kuwala/backend/dbt/{data_source.id}/profiles.yml",
    )

    with open(profile_path, "r") as file:
        profile_yaml = yaml.safe_load(file)

        file.close()

    controller = get_controller(data_catalog_item_id=data_source.data_catalog_item_id)
    profile_yaml = controller.update_dbt_connection_parameters(
        profile_yaml=profile_yaml, connection_parameters=connection_parameters
    )

    with open(profile_path, "w") as file:
        yaml.safe_dump(profile_yaml, file, indent=4)
        file.close()
