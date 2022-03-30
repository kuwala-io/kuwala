import json
import os

from controller.dbt_controller import create_empty_dbt_project
from database.crud.common import get_all_objects, get_object_by_id
from database.crud.data_source import create_data_source
from database.database import get_db
import database.models.data_catalog as models
import database.schemas.data_catalog as schemas_data_catalog
import database.schemas.data_source as schemas_data_source
from database.utils.encoder import list_props_to_json_props
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/data-catalog",
    tags=["data_catalog"],
)


@router.get("/", response_model=list[schemas_data_catalog.DataCatalogItem])
def get_all_items(db: Session = Depends(get_db)):
    items = get_all_objects(db=db, model=models.DataCatalogItem)
    items = list(
        map(
            lambda item: list_props_to_json_props(
                base_object=item, list_parameters=["connection_parameters"]
            ),
            items,
        )
    )

    return items


@router.post("/select", response_model=list[schemas_data_source.DataSource])
def select_items(
    items: schemas_data_catalog.DataCatalogSelect, db: Session = Depends(get_db)
):
    data_sources = list()

    for item_id in items.item_ids:
        data_catalog_item = get_object_by_id(
            db=db, model=models.DataCatalogItem, object_id=item_id
        )
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
            data_source=schemas_data_source.DataSourceCreate(
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

        if item_id == "postgres" or item_id == "bigquery" or item_id == "snowflake":
            script_dir = os.path.dirname(__file__)
            target_dir = os.path.join(script_dir, "../../../../tmp/kuwala/backend/dbt")

            create_empty_dbt_project(
                data_source_id=data_source.id, warehouse=item_id, target_dir=target_dir
            )

    return data_sources
