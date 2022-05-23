import itertools
import os
import subprocess
from typing import List, Union

from controller.data_source.data_source import (
    get_data_source_and_data_catalog_item_id,
    get_table_preview,
)
from controller.dbt_controller import run_dbt_models
from controller.utils.dbt_utils import get_dbt_model_dir
from controller.utils.yaml_utils import (
    terminal_output_to_dbt_model,
    terminal_output_to_source_yaml,
)
from database.crud.common import generate_object_id, get_object_by_id, update_attributes
from database.database import Base
from database.models.data_block import DataBlock
from database.models.transformation_block import TransformationBlock
from database.schemas.transformation_block import (
    TransformationBlockCreate,
    TransformationBlockUpdate,
)
from fastapi import HTTPException
import oyaml as yaml
from sqlalchemy.orm import Session


def get_dbt_dir(data_source_id: str) -> str:
    script_dir = os.path.dirname(__file__)

    return os.path.join(
        script_dir, f"../../../../tmp/kuwala/backend/dbt/{data_source_id}"
    )


def args_to_string(args: dict) -> str:
    encoded_dict = dict()

    def encode_yaml_parameter(string: str) -> str:
        return (
            string.replace(" ", "YAML_STRING_SPACE")
            .replace("(", "YAML_STRING_ROUND_BRACKET_OPEN")
            .replace(")", "YAML_STRING_ROUND_BRACKET_CLOSED")
            .replace("*", "YAML_STRING_STAR")
        )

    for key in args.keys():
        if isinstance(args[key], str):
            encoded_dict[key] = encode_yaml_parameter(args[key])
        else:
            encoded_dict[key] = []

            for item in args[key]:
                encoded_dict[key].append(encode_yaml_parameter(item))

    return str(encoded_dict)


def create_model(
    dbt_dir: str,
    name: str,
    base_data_blocks: list[DataBlock],
    base_transformation_blocks: list[TransformationBlock],
    transformation_block_id: str,
    transformation_catalog_item_id: str,
    args: dict,
    materialize_as_table: bool,
    db: Session,
):
    base_data_block = base_data_blocks[0]
    _, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        data_source_id=base_data_block.data_source_id, db=db
    )
    schema_name = base_data_block.schema_name
    table_name = base_data_block.table_name

    if data_catalog_item_id == "bigquery":
        schema_name = base_data_block.dataset_name

    output = subprocess.run(
        f"dbt run-operation {transformation_catalog_item_id} --args '{args_to_string(args)}' --profiles-dir .",
        cwd=dbt_dir,
        shell=True,
        capture_output=True,
    )
    dbt_model_dir = f"{dbt_dir}/models/marts/{schema_name}/{table_name}"
    dbt_model = terminal_output_to_dbt_model(output=output)

    if materialize_as_table:
        dbt_model = "{{ config(materialized='table') }}\n\n" + dbt_model

    base_id = (
        base_data_block.id
        if not base_transformation_blocks or len(base_transformation_blocks)
        else "_".join(list(map(lambda tb: tb.id, base_transformation_blocks)))
    )
    dbt_model_name = f"{'_'.join(map(lambda n: n.lower(), name.split()))}_{transformation_block_id}_{base_id}"

    with open(f"{dbt_model_dir}/{dbt_model_name}.sql", "w+") as file:
        file.write(dbt_model)
        file.close()

    return dbt_model_dir, dbt_model_name


def create_model_yaml(dbt_dir: str, dbt_model_dir: str, dbt_model_name: str):
    args = dict(model_name=dbt_model_name)
    output = subprocess.run(
        f"dbt run-operation generate_model_yaml --args '{args}' --profiles-dir .",
        cwd=dbt_dir,
        shell=True,
        capture_output=True,
    )
    source_yml = terminal_output_to_source_yaml(output=output)

    with open(f"{dbt_model_dir}/{dbt_model_name}.yml", "w+") as file:
        yaml.safe_dump(source_yml, file, indent=4)
        file.close()


def get_input_block(db: Session, object_id: str) -> Base:
    try:
        return get_object_by_id(db=db, model=DataBlock, object_id=object_id)
    except HTTPException:
        return get_object_by_id(db=db, model=TransformationBlock, object_id=object_id)


def get_base_blocks(
    db: Session,
    input_block_ids: list[str],
) -> Union[tuple[List[Base], List[Base]], tuple[List[Base], None]]:
    input_blocks = list(
        map(
            lambda object_id: get_input_block(db=db, object_id=object_id),
            input_block_ids,
        )
    )
    data_blocks = list(
        map(
            lambda data_block: [data_block],
            list(
                filter(
                    lambda ib: type(ib).__name__ == "DataBlock",
                    input_blocks,
                )
            ),
        )
    )
    transformation_blocks = list(
        filter(
            lambda ib: type(ib).__name__ == "TransformationBlock",
            input_blocks,
        )
    )

    if len(transformation_blocks):
        for tb in transformation_blocks:
            base_data_block = None
            next_parent_block = tb

            while not base_data_block:
                base_data_block, next_parent_block = get_base_blocks(
                    db=db, input_block_ids=next_parent_block.input_block_ids
                )

            data_blocks.append(base_data_block)

    return (
        list(
            itertools.chain(*data_blocks)
        ),  # Flatten nested lists from recursive calls,
        transformation_blocks if len(transformation_blocks) else None,
    )


def get_data_source_id(base_data_blocks: list[DataBlock]) -> str:
    data_source_ids = list(set(map(lambda bdb: bdb.data_source_id, base_data_blocks)))

    if len(data_source_ids) == 1:
        return data_source_ids[0]

    raise HTTPException(
        status_code=400,
        detail="Transformation is based on two different data sources which is currently not supported",
    )


def get_dbt_model_args(
    args: dict,
    block_columns: list[str],
    base_data_blocks: list[DataBlock],
    base_transformation_blocks: list[TransformationBlock],
    db: Session,
) -> dict:
    args["block_columns"] = block_columns

    if len(base_data_blocks) == 1 and not base_transformation_blocks:
        args["dbt_model"] = base_data_blocks[0].dbt_model
    elif "left_block" not in args.keys():
        args["dbt_model"] = base_transformation_blocks[0].dbt_model
    else:
        try:
            left_block = get_object_by_id(
                db=db, model=DataBlock, object_id=args["left_block"]
            )
        except HTTPException:
            left_block = get_object_by_id(
                db=db, model=TransformationBlock, object_id=args["left_block"]
            )

        try:
            right_block = get_object_by_id(
                db=db, model=DataBlock, object_id=args["right_block"]
            )
        except HTTPException:
            right_block = get_object_by_id(
                db=db, model=TransformationBlock, object_id=args["right_block"]
            )

        del args["left_block"]
        del args["right_block"]

        args["dbt_model_left"] = left_block.dbt_model
        args["dbt_model_right"] = right_block.dbt_model

    return args


def create_transformation_block(
    transformation_block: TransformationBlockCreate,
    db: Session,
):
    transformation_block_id = generate_object_id()
    base_data_blocks, base_transformation_blocks = get_base_blocks(
        db=db,
        input_block_ids=transformation_block.input_block_ids,
    )
    data_source_id = get_data_source_id(base_data_blocks)
    args = dict()

    for mp in transformation_block.macro_parameters:
        args[mp.id] = mp.value

    args = get_dbt_model_args(
        args=args,
        block_columns=["*"],
        base_data_blocks=base_data_blocks,
        base_transformation_blocks=base_transformation_blocks,
        db=db,
    )
    dbt_dir = get_dbt_dir(data_source_id=data_source_id)
    dbt_model_dir, dbt_model_name = create_model(
        db=db,
        name=transformation_block.name,
        dbt_dir=dbt_dir,
        transformation_block_id=transformation_block_id,
        base_data_blocks=base_data_blocks,
        base_transformation_blocks=base_transformation_blocks,
        transformation_catalog_item_id=transformation_block.transformation_catalog_item_id,
        args=args,
        materialize_as_table=transformation_block.materialize_as_table,
    )

    run_dbt_models(dbt_dir=dbt_dir, dbt_model_names=[dbt_model_name])
    create_model_yaml(
        dbt_dir=dbt_dir, dbt_model_dir=dbt_model_dir, dbt_model_name=dbt_model_name
    )

    return data_source_id, transformation_block_id, dbt_model_name


def update_transformation_block_columns(
    db: Session,
    dbt_dir: str,
    transformation_block: TransformationBlock,
    updated_columns: [str],
):
    args = dict()

    for macro_parameter in transformation_block.macro_parameters:
        args[macro_parameter["id"]] = macro_parameter["value"]

    base_data_blocks, base_transformation_blocks = get_base_blocks(
        db=db,
        input_block_ids=transformation_block.input_block_ids,
    )
    args = get_dbt_model_args(
        args=args,
        block_columns=updated_columns,
        base_data_blocks=base_data_blocks,
        base_transformation_blocks=base_transformation_blocks,
        db=db,
    )
    output = subprocess.run(
        f"dbt run-operation {transformation_block.transformation_catalog_item_id} --args '{args_to_string(args)}' --profiles-dir .",
        cwd=dbt_dir,
        shell=True,
        capture_output=True,
    )
    dbt_model_dir = get_dbt_model_dir(
        dbt_dir=dbt_dir, dbt_model_name=transformation_block.dbt_model
    )
    dbt_model = terminal_output_to_dbt_model(output=output)

    if transformation_block.materialize_as_table:
        dbt_model = "{{ config(materialized='table') }}\n\n" + dbt_model

    with open(f"{dbt_model_dir}/{transformation_block.dbt_model}.sql", "w+") as file:
        file.write(dbt_model)
        file.close()

    run_dbt_models(dbt_dir=dbt_dir, dbt_model_names=[transformation_block.dbt_model])
    create_model_yaml(
        dbt_dir=dbt_dir,
        dbt_model_dir=dbt_model_dir,
        dbt_model_name=transformation_block.dbt_model,
    )

    return update_attributes(
        db=db,
        db_object=transformation_block,
        attributes=[dict(name="columns", value=updated_columns)],
    )


def update_transformation_block(
    transformation_block_id: str,
    transformation_block: TransformationBlockUpdate,
    db: Session,
):
    db_transformation_block = get_object_by_id(
        db=db, model=TransformationBlock, object_id=transformation_block_id
    )
    dbt_dir = get_dbt_dir(data_source_id=db_transformation_block.data_source_id)

    if transformation_block.columns:
        db_transformation_block = update_transformation_block_columns(
            db=db,
            dbt_dir=dbt_dir,
            transformation_block=db_transformation_block,
            updated_columns=transformation_block.columns,
        )

    if transformation_block.position_x and transformation_block.position_y:
        db_transformation_block = update_attributes(
            db=db,
            db_object=db_transformation_block,
            attributes=[
                dict(name="position_x", value=transformation_block.position_x),
                dict(name="position_y", value=transformation_block.position_y),
            ],
        )

    return db_transformation_block


def get_transformation_block_preview(
    transformation_block_id: str,
    db: Session,
    limit_columns: int = None,
    limit_rows: int = None,
):
    transformation_block = get_object_by_id(
        db=db, model=TransformationBlock, object_id=transformation_block_id
    )

    return get_table_preview(
        data_source_id=transformation_block.data_source_id,
        schema_name="dbt_kuwala",
        dataset_name="dbt_kuwala",
        table_name=transformation_block.dbt_model,
        columns=None,
        limit_columns=limit_columns,
        limit_rows=limit_rows,
        db=db,
    )


def refresh_transformation_block(transformation_block_id: str, db: Session):
    transformation_block = get_object_by_id(
        db=db, model=TransformationBlock, object_id=transformation_block_id
    )
    dbt_dir = get_dbt_dir(data_source_id=transformation_block.data_source_id)
    dbt_model_name = transformation_block.dbt_model
    dbt_model_dir = get_dbt_model_dir(dbt_dir=dbt_dir, dbt_model_name=dbt_model_name)

    run_dbt_models(dbt_dir=dbt_dir, dbt_model_names=[dbt_model_name])
    create_model_yaml(
        dbt_dir=dbt_dir, dbt_model_dir=dbt_model_dir, dbt_model_name=dbt_model_name
    )

    return dict(success=True)
