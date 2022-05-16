import controller.data_source.data_source as data_source_controller
import controller.transformation_block_controller as transformation_block_controller
import database.crud.transformation_block as crud
from database.database import get_db
from database.schemas.transformation_block import (
    TransformationBlockCreate,
    TransformationBlockUpdate,
)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/block/transformation",
    tags=["transformation_block"],
)


@router.post("/")
def create_transformation_block(
    transformation_block: TransformationBlockCreate,
    db: Session = Depends(get_db),
):
    (
        data_source_id,
        transformation_block_id,
        model_name,
    ) = transformation_block_controller.create_transformation_block(
        transformation_block=transformation_block, db=db
    )
    columns = data_source_controller.get_columns(
        data_source_id=data_source_id,
        schema_name="dbt_kuwala",
        dataset_name="dbt_kuwala",
        table_name=model_name,
        db=db,
    )
    columns = list(map(lambda c: c["column"], columns))
    transformation_block = crud.create_transformation_block(
        db=db,
        transformation_block=transformation_block,
        data_source_id=data_source_id,
        generated_id=transformation_block_id,
        dbt_model=model_name,
        columns=columns,
    )

    return transformation_block


@router.put("/{transformation_block_id}")
def update_transformation_block(
    transformation_block_id: str,
    transformation_block: TransformationBlockUpdate,
    db: Session = Depends(get_db),
):
    return transformation_block_controller.update_transformation_block(
        transformation_block_id=transformation_block_id,
        transformation_block=transformation_block,
        db=db,
    )


@router.get("/{transformation_block_id}/preview")
def get_transformation_block_preview(
    transformation_block_id: str,
    limit_columns: int = None,
    limit_rows: int = None,
    db: Session = Depends(get_db),
):
    return transformation_block_controller.get_transformation_block_preview(
        transformation_block_id=transformation_block_id,
        limit_columns=limit_columns,
        limit_rows=limit_rows,
        db=db,
    )


@router.put("/{transformation_block_id}/refresh")
def refresh_transformation_block(
    transformation_block_id: str, db: Session = Depends(get_db)
):
    return transformation_block_controller.refresh_transformation_block(
        transformation_block_id=transformation_block_id, db=db
    )
