import argparse
import json
import logging
import os
import sys
from time import sleep

from database.crud import data_catalog as data_catalog_crud
from database.database import Engine, get_db
from database.models import data_catalog as data_catalog_models
from database.models import data_source as data_source_models
from database.schemas import data_catalog as data_catalog_schemas
from fastapi import FastAPI
import fastapi.exceptions
from fastapi.middleware.cors import CORSMiddleware
from routers import data_catalog, data_source
import sqlalchemy.exc
import uvicorn

app = FastAPI(title="Kuwala Backend", version="0.2.0-alpha")

# Set up middlewares
origins = [
    "http://localhost",
    "https://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "https://localhost:3000",
    "https://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up routers
app.include_router(data_catalog.router)
app.include_router(data_source.router)


# Cannot be placed under `database/database.py` as it would create a circular import
def populate_db():
    connected_to_db = False
    current_try = 0
    max_retries = 60
    sleep_time = 2
    error = None

    while not connected_to_db and current_try <= max_retries:
        try:
            data_catalog_models.Base.metadata.create_all(bind=Engine)
            data_source_models.Base.metadata.create_all(bind=Engine)

            connected_to_db = True
        except sqlalchemy.exc.OperationalError as e:
            error = e
            current_try += 1

            sleep(sleep_time)

    if not connected_to_db:
        logging.error(error)
        logging.error("Failed to connect to database.")
        sys.exit(1)

    db = next(get_db())

    script_dir = os.path.dirname(__file__)
    file = open(os.path.join(script_dir, "./resources/data_catalog_items.json"))
    data_catalog_items = json.load(file)

    for data_catalog_item in data_catalog_items:
        try:
            data_catalog_crud.get_data_catalog_item(
                db=db, data_catalog_item_id=data_catalog_item["id"]
            )
        except fastapi.exceptions.HTTPException as e:
            if e.status_code == 404:
                data_catalog_crud.create_data_catalog_item(
                    db=db,
                    data_catalog_item=data_catalog_schemas.DataCatalogItemCreate(
                        id=data_catalog_item["id"],
                        name=data_catalog_item["name"],
                        logo=data_catalog_item["logo"],
                        connection_parameters=json.dumps(
                            data_catalog_item["connection_parameters"]
                        ),
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
