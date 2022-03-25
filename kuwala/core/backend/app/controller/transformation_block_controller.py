import itertools
import os
import subprocess
from typing import List, Union

from controller.data_source.data_source import (
    get_data_source_and_data_catalog_item_id,
    get_table_preview,
)
from database.crud.common import generate_object_id, get_object_by_id
from database.database import Base, get_db
from database.models.data_block import DataBlock
from database.models.transformation_block import TransformationBlock
from database.schemas.transformation_block import TransformationBlockCreate
from fastapi import Depends, HTTPException
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
    dbt_model = output.stdout.decode("utf8").split("KUWALA TRANSFORMATION")[1][:-5]
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
    source_yml = yaml.safe_load(
        f"version: 2{output.stdout.decode('utf8').split('version: 2')[1][:-5]}"
    )

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
    input_blocks_types = list(map(lambda ib: type(ib).__name__, input_blocks))
    number_of_data_blocks = len(
        list(
            filter(
                lambda input_block_type: input_block_type == "DataBlock",
                input_blocks_types,
            )
        )
    )
    number_of_transformation_blocks = len(
        list(
            filter(
                lambda input_block_type: input_block_type == "TransformationBlock",
                input_blocks_types,
            )
        )
    )

    if number_of_transformation_blocks == 0:
        return input_blocks, None
    elif number_of_data_blocks == 0:
        base_data_blocks = list()

        for input_block in input_blocks:
            base_data_block = None
            next_parent_block = input_block

            while not base_data_block:
                base_data_block, next_parent_block = get_base_blocks(
                    db=db, input_block_ids=next_parent_block.input_block_ids
                )

            base_data_blocks.append(base_data_block)

        return list(itertools.chain(*base_data_blocks)), input_blocks

    raise HTTPException(
        status_code=400,
        detail="Cannot find base data block",
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
    base_data_blocks: list[DataBlock],
    base_transformation_blocks: list[TransformationBlock],
    db: Session,
) -> dict:
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
    )

    output = subprocess.run(
        f"dbt run --select {dbt_model_name} --profiles-dir .",
        cwd=dbt_dir,
        shell=True,
        capture_output=True,
    )
    number_of_errors = int(
        output.stdout.decode("utf8").split("ERROR=")[1].split("SKIP=")[0][:-1]
    )

    if number_of_errors:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to run dbt model with {number_of_errors} {'errors' if number_of_errors > 1 else 'error'}",
        )

    create_model_yaml(
        dbt_dir=dbt_dir, dbt_model_dir=dbt_model_dir, dbt_model_name=dbt_model_name
    )

    return data_source_id, transformation_block_id, dbt_model_name


def get_transformation_block_preview(
    transformation_block_id: str,
    limit_columns: int = None,
    limit_rows: int = None,
    db: Session = Depends(get_db),
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
