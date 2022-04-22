from sqlalchemy.orm import Session

from ..database import add_and_commit_to_db
from ..models import data_catalog as models
from ..schemas import data_catalog as schemas


def create_data_catalog_item(
    db: Session, data_catalog_item: schemas.DataCatalogItemCreate
) -> models.DataCatalogItem:
    db_data_catalog_item = models.DataCatalogItem(
        id=data_catalog_item.id,
        name=data_catalog_item.name,
        logo=data_catalog_item.logo,
        connection_parameters=data_catalog_item.connection_parameters,
    )

    add_and_commit_to_db(db=db, model=db_data_catalog_item)

    return db_data_catalog_item
