from controller.transformation_block_controller import (
    get_base_blocks,
    get_data_source_id,
)
from database.crud.common import generate_object_id, get_object_by_id, update_attributes
from database.models.export_block import ExportBlock
from database.schemas.export_block import ExportBlockCreate, ExportBlockUpdate
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
