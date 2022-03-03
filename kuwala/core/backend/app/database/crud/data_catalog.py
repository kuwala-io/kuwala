from sqlalchemy.orm import Session

from ..models import data_catalog as models
from ..schemas import data_catalog as schemas


def get_data_catalog_item(db: Session, data_catalog_item_id: str):
    return (
        db.query(models.DataCatalogItem)
        .filter(models.DataCatalogItem.id == data_catalog_item_id)
        .first()
    )


def get_data_catalog_items(db: Session):
    return db.query(models.DataCatalogItem).all()


def create_data_catalog_item(
    db: Session, data_catalog_item: schemas.DataCatalogItemCreate
):
    db_data_catalog_item = models.DataCatalogItem(
        id=data_catalog_item.id,
        name=data_catalog_item.name,
        logo=data_catalog_item.logo,
        connection_parameters=data_catalog_item.connection_parameters,
    )

    db.add(db_data_catalog_item)
    db.commit()
    db.refresh(db_data_catalog_item)

    return db_data_catalog_item
