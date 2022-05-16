from sqlalchemy.orm import Session

from ..database import add_and_commit_to_db
from ..models import transformation_block as models
from ..schemas import transformation_block as schemas


def create_transformation_block(
    db: Session,
    transformation_block: schemas.TransformationBlockCreate,
    data_source_id: str,
    generated_id: str,
    dbt_model: str,
    columns: [str],
) -> models.TransformationBlock:
    macro_parameters = list(
        map(lambda mp: mp.dict(), transformation_block.macro_parameters)
    )

    db_data_block = models.TransformationBlock(
        id=generated_id,
        transformation_catalog_item_id=transformation_block.transformation_catalog_item_id,
        data_source_id=data_source_id,
        input_block_ids=transformation_block.input_block_ids,
        macro_parameters=macro_parameters,
        name=transformation_block.name,
        columns=columns,
        dbt_model=dbt_model,
        materialize_as_table=transformation_block.materialize_as_table,
    )

    add_and_commit_to_db(db=db, model=db_data_block)

    return db_data_block
