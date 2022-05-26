from sqlalchemy.orm import Session

from ..database import add_and_commit_to_db
from ..models import export_catalog as models
from ..schemas import export_catalog as schemas


def create_export_catalog_item(
    db: Session,
    export_catalog_item: schemas.ExportCatalogItemCreate,
) -> models.ExportCatalogItem:
    db_export_catalog_item = models.ExportCatalogItem(
        id=export_catalog_item.id,
        category=export_catalog_item.category,
        name=export_catalog_item.name,
        icon=export_catalog_item.icon,
        description=export_catalog_item.description,
        min_number_of_input_blocks=export_catalog_item.min_number_of_input_blocks,
        max_number_of_input_blocks=export_catalog_item.max_number_of_input_blocks,
        macro_parameters=export_catalog_item.macro_parameters,
    )

    add_and_commit_to_db(db=db, model=db_export_catalog_item)

    return db_export_catalog_item
