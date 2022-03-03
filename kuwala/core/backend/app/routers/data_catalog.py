import json

from database.crud.data_catalog import get_data_catalog_items
from database.database import get_db
from database.schemas.data_catalog import DataCatalogItem
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/data-catalog",
    tags=["data_catalog"],
)


@router.get("/", response_model=list[DataCatalogItem])
def get_all_items(db: Session = Depends(get_db)):
    items = get_data_catalog_items(db)

    def transform_item(item):
        item.connection_parameters = json.dumps(item.connection_parameters)

        return item

    items = list(map(lambda item: transform_item(item), items))

    return items
