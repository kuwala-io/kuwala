from database.crud.common import get_all_objects
import database.models.data_block as data_block_model
import database.models.transformation_block as transformation_block_model
from sqlalchemy.orm import Session


def get_all_blocks(db: Session) -> dict:
    data_blocks = get_all_objects(db=db, model=data_block_model.DataBlock)
    transformation_blocks = get_all_objects(
        db=db, model=transformation_block_model.TransformationBlock
    )

    return dict(data_blocks=data_blocks, transformation_blocks=transformation_blocks)
