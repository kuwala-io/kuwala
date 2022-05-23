import os
from pathlib import Path
import subprocess

from controller.data_source.data_source import (
    get_data_source_and_data_catalog_item_id,
    get_table_preview,
)
from controller.dbt_controller import run_dbt_models
from controller.utils.yaml_utils import (
    terminal_output_to_base_model,
    terminal_output_to_source_yaml,
)
from database.crud.common import generate_object_id, get_object_by_id, update_attributes
from database.models.data_block import DataBlock
from database.schemas.data_block import DataBlockCreate, DataBlockUpdate
import oyaml as yaml
from sqlalchemy.orm import Session


def get_dbt_dir(data_source_id: str) -> str:
    script_dir = os.path.dirname(__file__)

    return os.path.join(
        script_dir, f"../../../../tmp/kuwala/backend/dbt/{data_source_id}"
    )


def generate_model_name(name: str, data_block_id: str):
    return f"{'_'.join(map(lambda n: n.lower(), name.split()))}_{data_block_id}"


def create_source_yaml(dbt_dir: str, schema_name: str, update_yaml: bool = False):
    dbt_source_model_dir = dbt_dir + f"/models/staging/{schema_name}"

    if os.path.exists(dbt_source_model_dir) and not update_yaml:
        return

    args = dict(
        schema_name=schema_name, generate_columns=True, include_descriptions=True
    )
    output = subprocess.run(
        f"dbt run-operation generate_source --args '{args}' --profiles-dir .",
        cwd=dbt_dir,
        shell=True,
        capture_output=True,
    )
    source_yml = terminal_output_to_source_yaml(output=output)

    Path(dbt_source_model_dir).mkdir(parents=True, exist_ok=True)

    with open(f"{dbt_source_model_dir}/src_{schema_name}.yml", "w+") as file:
        yaml.safe_dump(source_yml, file, indent=4)
        file.close()


def create_base_model(
    dbt_dir: str,
    data_source_id: str,
    schema_name: str,
    dataset_name: str,
    table_name: str,
    db: Session,
):
    base_model_name = f"stg_{schema_name}_{table_name}"
    dbt_base_model_path = (
        f"{dbt_dir}/models/staging/{schema_name}/{base_model_name}.sql"
    )

    if os.path.exists(dbt_base_model_path):
        return base_model_name

    args = dict(source_name=schema_name, table_name=table_name)
    output = subprocess.run(
        f"dbt run-operation generate_base_model --args '{args}' --profiles-dir .",
        cwd=dbt_dir,
        shell=True,
        capture_output=True,
    )
    base_model = terminal_output_to_base_model(
        output=output,
        data_source_id=data_source_id,
        schema_name=schema_name,
        dataset_name=dataset_name,
        table_name=table_name,
        db=db,
    )

    with open(dbt_base_model_path, "w+") as file:
        file.write(base_model)
        file.close()

    return base_model_name


def create_model(
    dbt_dir: str,
    data_block_id: str,
    name: str,
    schema_name: str,
    table_name: str,
    columns: list[str],
    generate_name: bool = True,
):
    if not columns:
        columns = "*"
    else:
        columns = ", ".join(columns)

    model = """
        SELECT columns
        FROM {{ ref('stg_schema_name_table_name') }}
    """
    model = model.replace("columns", columns)
    model = model.replace("schema_name", schema_name)
    model = model.replace("table_name", table_name)
    model_name = (
        generate_model_name(name=name, data_block_id=data_block_id)
        if generate_name
        else name
    )
    model_dir = f"{dbt_dir}/models/marts/{schema_name}/{table_name}"

    Path(model_dir).mkdir(parents=True, exist_ok=True)

    with open(f"{model_dir}/{model_name}.sql", "w+") as file:
        file.write(model)
        file.close()

    return model_name


def create_model_yaml(dbt_dir: str, schema_name: str, table_name: str, model_name: str):
    args = dict(model_name=model_name)
    output = subprocess.run(
        f"dbt run-operation generate_model_yaml --args '{args}' --profiles-dir .",
        cwd=dbt_dir,
        shell=True,
        capture_output=True,
    )
    source_yml = terminal_output_to_source_yaml(output=output)

    with open(
        f"{dbt_dir}/models/marts/{schema_name}/{table_name}/{model_name}.yml", "w+"
    ) as file:
        yaml.safe_dump(source_yml, file, indent=4)
        file.close()


def create_data_block(data_block: DataBlockCreate, db: Session):
    _, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        data_source_id=data_block.data_source_id, db=db
    )
    data_source_id = data_block.data_source_id
    dataset_name = data_block.dataset_name
    schema_name = data_block.schema_name
    table_name = data_block.table_name
    columns = list(map(lambda c: c.lower(), data_block.columns))

    if data_catalog_item_id == "bigquery":
        schema_name = data_block.dataset_name

    if data_catalog_item_id == "snowflake":
        schema_name = data_block.schema_name.lower()
        table_name = data_block.table_name.lower()

    dbt_dir = get_dbt_dir(data_source_id=data_source_id)

    create_source_yaml(dbt_dir=dbt_dir, schema_name=schema_name)

    base_model_name = create_base_model(
        dbt_dir=dbt_dir,
        data_source_id=data_source_id,
        schema_name=schema_name,
        dataset_name=dataset_name,
        table_name=table_name,
        db=db,
    )
    data_block_id = generate_object_id()
    model_name = create_model(
        dbt_dir=dbt_dir,
        data_block_id=data_block_id,
        name=data_block.name,
        schema_name=schema_name,
        table_name=table_name,
        columns=columns,
    )
    base_model_rows = get_table_preview(
        data_source_id=data_source_id,
        schema_name="dbt_kuwala",
        dataset_name="dbt_kuwala",
        table_name=base_model_name,
        columns=None,
        limit_columns=1,
        limit_rows=1,
        db=db,
    )
    dbt_model_names = (
        [base_model_name, model_name] if not base_model_rows else [model_name]
    )

    run_dbt_models(dbt_dir=dbt_dir, dbt_model_names=dbt_model_names)
    create_model_yaml(
        dbt_dir=dbt_dir,
        schema_name=schema_name,
        table_name=data_block.table_name,
        model_name=model_name,
    )

    return data_block_id, model_name


def update_data_block_name(
    db: Session, dbt_dir: str, data_block: DataBlock, updated_name: str
) -> DataBlock:
    updated_model_name = generate_model_name(updated_name, data_block_id=data_block.id)
    _, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        data_source_id=data_block.data_source_id, db=db
    )
    schema_name = data_block.schema_name

    if data_catalog_item_id == "bigquery":
        schema_name = data_block.dataset_name

    dbt_model_dir = f"{dbt_dir}/models/marts/{schema_name}/{data_block.table_name}"
    updated_yaml_path = f"{dbt_model_dir}/{updated_model_name}.yml"

    # Rename SQL and YAML files
    os.rename(
        f"{dbt_model_dir}/{data_block.dbt_model}.sql",
        f"{dbt_model_dir}/{updated_model_name}.sql",
    )
    os.rename(
        f"{dbt_model_dir}/{data_block.dbt_model}.yml",
        updated_yaml_path,
    )

    # Update model name in YAML file
    with open(updated_yaml_path, "r") as read_file:
        model_yml = yaml.safe_load(read_file)
        model_yml["models"][0]["name"] = updated_model_name

        read_file.close()

        with open(updated_yaml_path, "w") as write_file:
            yaml.safe_dump(model_yml, write_file, indent=4)
            write_file.close()

    return update_attributes(
        db=db,
        db_object=data_block,
        attributes=[
            dict(name="dbt_model", value=updated_model_name),
            dict(name="name", value=updated_name),
        ],
    )


def update_data_block_columns(
    db: Session, dbt_dir: str, data_block: DataBlock, updated_columns: [str]
):
    _, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        data_source_id=data_block.data_source_id, db=db
    )
    schema_name = data_block.schema_name

    if data_catalog_item_id == "bigquery":
        schema_name = data_block.dataset_name

    create_model(
        dbt_dir=dbt_dir,
        data_block_id=data_block.id,
        name=data_block.dbt_model,
        schema_name=schema_name,
        table_name=data_block.table_name,
        columns=updated_columns,
        generate_name=False,
    )
    run_dbt_models(dbt_dir=dbt_dir, dbt_model_names=[data_block.dbt_model])
    create_model_yaml(
        dbt_dir=dbt_dir,
        schema_name=schema_name,
        model_name=data_block.dbt_model,
        table_name=data_block.table_name,
    )

    return update_attributes(
        db=db,
        db_object=data_block,
        attributes=[dict(name="columns", value=updated_columns)],
    )


def update_data_block(data_block_id: str, data_block: DataBlockUpdate, db: Session):
    db_data_block = get_object_by_id(db=db, model=DataBlock, object_id=data_block_id)
    dbt_dir = get_dbt_dir(data_source_id=db_data_block.data_source_id)

    if data_block.name:
        db_data_block = update_data_block_name(
            db=db,
            dbt_dir=dbt_dir,
            data_block=db_data_block,
            updated_name=data_block.name,
        )

        run_dbt_models(dbt_dir=dbt_dir, dbt_model_names=[db_data_block.dbt_model])

    if data_block.columns:
        db_data_block = update_data_block_columns(
            db=db,
            dbt_dir=dbt_dir,
            data_block=db_data_block,
            updated_columns=data_block.columns,
        )

    if data_block.position_x and data_block.position_y:
        db_data_block = update_attributes(
            db=db,
            db_object=db_data_block,
            attributes=[
                dict(name="position_x", value=data_block.position_x),
                dict(name="position_y", value=data_block.position_y),
            ],
        )

    return db_data_block


def get_data_block_preview(
    data_block_id: str,
    db: Session,
    limit_columns: int = None,
    limit_rows: int = None,
):
    data_block = get_object_by_id(db=db, model=DataBlock, object_id=data_block_id)
    data_source, _ = get_data_source_and_data_catalog_item_id(
        db=db, data_source_id=data_block.data_source_id
    )

    return get_table_preview(
        data_source_id=data_source.id,
        schema_name="dbt_kuwala",
        dataset_name="dbt_kuwala",
        table_name=data_block.dbt_model,
        columns=None,
        limit_columns=limit_columns,
        limit_rows=limit_rows,
        db=db,
    )


def refresh_sources(data_source_id: str, schema_name: str):
    dbt_dir = get_dbt_dir(data_source_id=data_source_id)

    create_source_yaml(dbt_dir=dbt_dir, schema_name=schema_name, update_yaml=True)

    return dict(success=True)
