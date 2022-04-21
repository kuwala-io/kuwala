from sqlalchemy.orm import Session

from ..database import add_and_commit_to_db
from ..models import transformation_catalog as models
from ..schemas import transformation_catalog as schemas


def create_transformation_catalog_item(
    db: Session,
    transformation_catalog_item: schemas.TransformationCatalogItemCreate,
) -> models.TransformationCatalogItem:
    db_transformation_catalog_item = models.TransformationCatalogItem(
        id=transformation_catalog_item.id,
        category=transformation_catalog_item.category,
        name=transformation_catalog_item.name,
        icon=transformation_catalog_item.icon,
        description=transformation_catalog_item.description,
        required_column_types=transformation_catalog_item.required_column_types,
        optional_column_types=transformation_catalog_item.optional_column_types,
        min_number_of_input_blocks=transformation_catalog_item.min_number_of_input_blocks,
        max_number_of_input_blocks=transformation_catalog_item.max_number_of_input_blocks,
        macro_parameters=transformation_catalog_item.macro_parameters,
        examples_before=transformation_catalog_item.examples_before,
        examples_after=transformation_catalog_item.examples_after,
    )

    add_and_commit_to_db(db=db, model=db_transformation_catalog_item)

    return db_transformation_catalog_item
