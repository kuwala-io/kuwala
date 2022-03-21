import json
import uuid

from database.crud.data_catalog import get_data_catalog_item, get_data_catalog_items
from database.crud.data_source import create_data_source
from database.database import get_db
from database.schemas.data_catalog import DataCatalogItem, DataCatalogSelect
from database.schemas.data_source import DataSource, DataSourceCreate
from database.utils.encoder import list_props_to_json_props
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/data-catalog",
    tags=["data_catalog"],
)


@router.get("/", response_model=list[DataCatalogItem])
def get_all_items(db: Session = Depends(get_db)):
    items = get_data_catalog_items(db)
    items = list(
        map(
            lambda item: list_props_to_json_props(
                base_object=item, list_parameters=["connection_parameters"]
            ),
            items,
        )
    )

    return items


@router.post("/select", response_model=list[DataSource])
def select_items(items: DataCatalogSelect, db: Session = Depends(get_db)):
    data_sources = list()

    for item_id in items.item_ids:
        data_catalog_item = get_data_catalog_item(db=db, data_catalog_item_id=item_id)
        connection_parameters = json.dumps(
            list(
                map(
                    lambda cp: dict(id=cp["id"], value=""),
                    data_catalog_item.connection_parameters,
                )
            )
        )
        data_source = create_data_source(
            db=db,
            data_source=DataSourceCreate(
                id=str(uuid.uuid4()),
                data_catalog_item_id=item_id,
                connection_parameters=connection_parameters,
                connected=False,
            ),
        )

        data_sources.append(
            list_props_to_json_props(
                base_object=data_source, list_parameters=["connection_parameters"]
            )
        )

    return data_sources
