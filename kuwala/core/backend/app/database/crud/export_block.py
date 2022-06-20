from sqlalchemy.orm import Session

from ..database import add_and_commit_to_db
from ..models import export_block as models
from ..schemas import export_block as schemas


def create_export_block(
    db: Session,
    export_block: schemas.ExportBlockCreate,
    data_source_id: str,
    generated_id: str,
) -> models.ExportBlock:
    macro_parameters = list(map(lambda mp: mp.dict(), export_block.macro_parameters))

    db_export_block = models.ExportBlock(
        id=generated_id,
        export_catalog_item_id=export_block.export_catalog_item_id,
        data_source_id=data_source_id,
        input_block_ids=export_block.input_block_ids,
        macro_parameters=macro_parameters,
        name=export_block.name,
        position_x=export_block.position_x,
        position_y=export_block.position_y,
    )

    add_and_commit_to_db(db=db, model=db_export_block)

    return db_export_block
