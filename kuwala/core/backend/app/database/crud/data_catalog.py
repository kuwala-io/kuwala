import database.database as database
from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models import data_catalog as models
from ..schemas import data_catalog as schemas


def get_data_catalog_item(
    db: Session, data_catalog_item_id: str
) -> models.DataCatalogItem:
    data_catalog_item = db.get(models.DataCatalogItem, data_catalog_item_id)

    if not data_catalog_item:
        raise HTTPException(status_code=404, detail="Data catalog item not found")

    return data_catalog_item


def get_data_catalog_items(db: Session) -> [models.DataCatalogItem]:
    return db.query(models.DataCatalogItem).all()


def create_data_catalog_item(
    db: Session, data_catalog_item: schemas.DataCatalogItemCreate
) -> models.DataCatalogItem:
    db_data_catalog_item = models.DataCatalogItem(
        id=data_catalog_item.id,
        name=data_catalog_item.name,
        logo=data_catalog_item.logo,
        connection_parameters=data_catalog_item.connection_parameters,
    )

    database.add_and_commit_to_db(db=db, model=db_data_catalog_item)

    return db_data_catalog_item
