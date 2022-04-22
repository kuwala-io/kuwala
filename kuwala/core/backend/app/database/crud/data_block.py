from sqlalchemy.orm import Session

from ..database import add_and_commit_to_db
from ..models import data_block as models
from ..schemas import data_block as schemas


def create_data_block(
    db: Session, data_block: schemas.DataBlockCreate, generated_id: str, dbt_model: str
) -> models.DataBlock:
    db_data_block = models.DataBlock(
        id=generated_id,
        data_source_id=data_block.data_source_id,
        name=data_block.name,
        dbt_model=dbt_model,
        table_name=data_block.table_name,
        schema_name=data_block.schema_name,
        dataset_name=data_block.dataset_name,
        columns=data_block.columns,
    )

    add_and_commit_to_db(db=db, model=db_data_block)

    return db_data_block
