import controller.data_block_controller as data_block_controller
import database.crud.data_block as crud
from database.database import get_db
from database.schemas.data_block import DataBlockCreate, DataBlockUpdate
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/block/data",
    tags=["data_block"],
)


@router.post("/")
def create_data_block(
    data_block: DataBlockCreate,
    db: Session = Depends(get_db),
):
    data_block_id, model_name = data_block_controller.create_data_block(
        data_block=data_block, db=db
    )
    data_block = crud.create_data_block(
        db=db,
        data_block=DataBlockCreate(
            data_source_id=data_block.data_source_id,
            name=data_block.name,
            table_name=data_block.table_name,
            schema_name=data_block.schema_name,
            dataset_name=data_block.dataset_name,
            columns=data_block.columns,
        ),
        generated_id=data_block_id,
        dbt_model=model_name,
    )

    return data_block


@router.put("/")
def update_data_block(
    data_block: DataBlockUpdate,
    db: Session = Depends(get_db),
):
    return data_block_controller.update_data_block(data_block=data_block, db=db)


@router.get("/{data_block_id}/preview")
def get_data_block_preview(
    data_block_id: str,
    limit_columns: int = None,
    limit_rows: int = None,
    db: Session = Depends(get_db),
):
    return data_block_controller.get_data_block_preview(
        data_block_id=data_block_id,
        limit_columns=limit_columns,
        limit_rows=limit_rows,
        db=db,
    )
