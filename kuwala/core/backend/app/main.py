import argparse
import json
import os

from database.crud import data_catalog as data_catalog_crud
from database.database import Engine, get_db
from database.models import data_catalog as data_catalog_models
from database.schemas import data_catalog as data_catalog_schemas
from fastapi import FastAPI
from routers import data_catalog
import uvicorn

data_catalog_models.Base.metadata.create_all(bind=Engine)

app = FastAPI(title="Kuwala Backend", version="0.2.0-alpha")

app.include_router(data_catalog.router)


def populate_db():
    db = next(get_db())

    script_dir = os.path.dirname(__file__)
    file = open(os.path.join(script_dir, "./resources/data_catalog_items.json"))
    data_catalog_items = json.load(file)

    for data_catalog_item in data_catalog_items:
        existing_data_catalog_item = data_catalog_crud.get_data_catalog_item(
            db=db, data_catalog_item_id=data_catalog_item["id"]
        )

        if not existing_data_catalog_item:
            data_catalog_crud.create_data_catalog_item(
                db=db,
                data_catalog_item=data_catalog_schemas.DataCatalogItemCreate(
                    id=data_catalog_item["id"],
                    name=data_catalog_item["name"],
                    logo=data_catalog_item["logo"],
                ),
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--dev",
        help="Launch server in development mode with automatic reload on code changes",
    )

    args = parser.parse_args()

    populate_db()

    reload = False

    if args.dev:
        reload = True

    uvicorn.run("__main__:app", host="0.0.0.0", port=8000, reload=reload)
