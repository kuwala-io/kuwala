from controller.data_source.data_source import save_as_csv
from controller.export_block.common import get_result_dir
from controller.transformation_block_controller import get_input_block
from database.crud.common import get_object_by_id
from database.models.export_block import ExportBlock
from fastapi import HTTPException
from sqlalchemy.orm import Session


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

    input_block = get_input_block(object_id=export_block.input_block_ids[0], db=db)

    # Save result into temporary dir
    result_dir = get_result_dir(
        data_source_id=data_source_id, file_name=args["file_name"]
    )

    input_block_type = type(input_block).__name__

    if input_block_type == "TransformationBlock":
        schema_name = "dbt_kuwala"
        dataset_name = "dbt_kuwala"
        table_name = input_block.dbt_model
    else:
        schema_name = get_str_from_tuple(input_block.schema_name)
        dataset_name = get_str_from_tuple(input_block.dataset_name)
        table_name = get_str_from_tuple(input_block.table_name)

    save_as_csv(
        data_source_id=input_block.data_source_id,
        schema_name=schema_name,
        dataset_name=dataset_name,
        table_name=table_name,
        columns=input_block.columns,
        result_dir=result_dir,
        db=db,
        delimiter_id=args["delimiter"],
    )

    # Return parameter to trigger download for the temporary file
    return result_dir, args["file_name"], "text/csv"


def get_str_from_tuple(tup):
    try:
        return str("".join(tup))
    except TypeError:
        return None
