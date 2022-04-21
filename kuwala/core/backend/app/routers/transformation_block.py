import controller.transformation_block_controller as transformation_block_controller
import database.crud.transformation_block as crud
from database.database import get_db
from database.schemas.transformation_block import TransformationBlockCreate
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
    transformation_block = crud.create_transformation_block(
        db=db,
        transformation_block=transformation_block,
        data_source_id=data_source_id,
        generated_id=transformation_block_id,
        dbt_model=model_name,
    )

    return transformation_block


@router.get("/{transformation_block_id}/preview")
def get_data_block_preview(
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
