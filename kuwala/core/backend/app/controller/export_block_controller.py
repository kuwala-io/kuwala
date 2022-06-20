import os
import time

from controller.data_source.data_source import save_as_csv
from controller.transformation_block_controller import (
    get_base_blocks,
    get_data_source_id,
    get_input_block,
)
from database.crud.common import generate_object_id, get_object_by_id, update_attributes
from database.models.data_source import DataSource
from database.models.export_block import ExportBlock
from database.schemas.export_block import ExportBlockCreate, ExportBlockUpdate
from fastapi import HTTPException
from sqlalchemy.orm import Session


def create_export_block(
    export_block: ExportBlockCreate,
    db: Session,
):
    export_block_id = generate_object_id()
    base_data_blocks, base_transformation_blocks = get_base_blocks(
        db=db,
        input_block_ids=export_block.input_block_ids,
    )
    data_source_id = get_data_source_id(base_data_blocks)
    return export_block_id, data_source_id


def update_export_block(
    export_block_id: str,
    export_block: ExportBlockUpdate,
    db: Session,
):
    db_export_block = get_object_by_id(
        db=db, model=ExportBlock, object_id=export_block_id
    )

    if export_block.position_x and export_block.position_y:
        db_export_block = update_attributes(
            db=db,
            db_object=db_export_block,
            attributes=[
                dict(name="position_x", value=export_block.position_x),
                dict(name="position_y", value=export_block.position_y),
            ],
        )

    return db_export_block


def download_as_csv(
    export_block_id: str,
    db: Session,
):
    export_block = get_object_by_id(db=db, model=ExportBlock, object_id=export_block_id)
    data_source_id = export_block.data_source_id

    args = dict()
    for mp in export_block.macro_parameters:
        args[mp["id"]] = mp["value"]

    if len(export_block.input_block_ids) >= 2:
        raise HTTPException(
            status_code=400,
            detail="Export block based on two different data blocks is currently not supported",
        )

    data_block = get_input_block(object_id=export_block.input_block_ids[0], db=db)

    # Save result into temporary dir
    result_dir = get_result_dir(
        data_source_id=data_source_id, file_name=args["file_name"]
    )
    if type(data_block).__name__ == "TransformationBlock":
        save_as_csv(
            data_source_id=data_block.data_source_id,
            schema_name="dbt_kuwala",
            dataset_name="dbt_kuwala",
            table_name=data_block.dbt_model,
            columns=data_block.columns,
            result_dir=result_dir,
            db=db,
            delimiter_id=args["delimiter"],
        )
    elif type(data_block).__name__ == "DataBlock":
        save_as_csv(
            data_source_id=data_block.data_source_id,
            schema_name=data_block.schema_name,
            dataset_name=data_block.dataset_name,
            table_name=data_block.table_name,
            result_dir=result_dir,
            columns=data_block.columns,
            db=db,
            delimiter_id=args["delimiter"],
        )

    # Trigger download for temporary file
    return result_dir, args["file_name"], "text/csv"


def get_result_dir(data_source_id: str, file_name: str) -> str:
    script_dir = os.path.dirname(__file__)
    data_source_result_dir = os.path.join(
        script_dir, f"../../../../tmp/kuwala/backend/results/{data_source_id}"
    )
    is_exist = os.path.exists(data_source_result_dir)
    if not is_exist:
        os.makedirs(data_source_result_dir, exist_ok=True)
    file_name = f"{int(time.time())}_{file_name}"
    return f"{data_source_result_dir}/{file_name}"
