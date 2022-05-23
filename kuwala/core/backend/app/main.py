import argparse
import json
import logging
import os
import sys
from time import sleep

from database.crud.common import get_object_by_id
from database.crud.data_catalog import create_data_catalog_item
from database.crud.transformation_catalog import create_transformation_catalog_item
from database.crud.transformation_catalog_category import (
    create_transformation_catalog_category,
)
from database.database import Engine, get_db
from database.models import (
    transformation_catalog_category as transformation_catalog_category_models,
)
from database.models import data_block as data_block_models
from database.models import data_catalog as data_catalog_models
from database.models import data_source as data_source_models
from database.models import transformation_block as transformation_block_models
from database.models import transformation_catalog as transformation_catalog_models
from database.schemas import (
    transformation_catalog_category as transformation_catalog_category_schemas,
)
from database.schemas import data_catalog as data_catalog_schemas
from database.schemas import transformation_catalog as transformation_catalog_schemas
from fastapi import FastAPI
import fastapi.exceptions
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    block,
    data_block,
    data_catalog,
    data_source,
    transformation_block,
    transformation_catalog,
)
import sqlalchemy.exc
import uvicorn

app = FastAPI(
    title="Kuwala Backend",
    version="0.2.0-alpha",
    responses={400: {"description": "Bad request"}, 404: {"description": "Not found"}},
)

# Set up middlewares
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up routers
app.include_router(block.router)
app.include_router(data_block.router)
app.include_router(data_catalog.router)
app.include_router(data_source.router)
app.include_router(transformation_block.router)
app.include_router(transformation_catalog.router)


# Cannot be placed under `database/database.py` as it would create a circular import
def populate_db():
    connected_to_db = False
    current_try = 0
    max_retries = 60
    sleep_time = 2
    error = None

    # Create empty tables if they don't exist
    while not connected_to_db and current_try <= max_retries:
        try:
            data_block_models.Base.metadata.create_all(bind=Engine)
            data_catalog_models.Base.metadata.create_all(bind=Engine)
            data_source_models.Base.metadata.create_all(bind=Engine)
            transformation_catalog_category_models.Base.metadata.create_all(bind=Engine)
            transformation_catalog_models.Base.metadata.create_all(bind=Engine)
            transformation_block_models.Base.metadata.create_all(bind=Engine)

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

    # Add data catalog items to database
    script_dir = os.path.dirname(__file__)
    file = open(os.path.join(script_dir, "./resources/data_catalog_items.json"))
    data_catalog_items = json.load(file)

    for dci in data_catalog_items:
        try:
            get_object_by_id(
                db=db,
                model=data_catalog_models.DataCatalogItem,
                object_id=dci["id"],
            )
        except fastapi.exceptions.HTTPException as e:
            if e.status_code == 404:
                create_data_catalog_item(
                    db=db,
                    data_catalog_item=data_catalog_schemas.DataCatalogItemCreate(
                        id=dci["id"],
                        name=dci["name"],
                        logo=dci["logo"],
                        connection_parameters=json.dumps(dci["connection_parameters"]),
                    ),
                )

    # Add transformation catalog categories to database
    file = open(
        os.path.join(script_dir, "./resources/transformation_catalog/categories.json")
    )
    transformation_catalog_categories = json.load(file)

    for tcc in transformation_catalog_categories:
        try:
            get_object_by_id(
                db=db,
                model=transformation_catalog_category_models.TransformationCatalogCategory,
                object_id=tcc["id"],
            )
        except fastapi.exceptions.HTTPException as e:
            if e.status_code == 404:
                create_transformation_catalog_category(
                    db=db,
                    transformation_catalog_category=transformation_catalog_category_schemas.TransformationCatalogCategoryCreate(
                        id=tcc["id"],
                        name=tcc["name"],
                        icon=tcc["icon"],
                    ),
                )

    # Add transformation catalog items to database
    transformation_catalog_path = os.path.join(
        script_dir, "./resources/transformation_catalog"
    )
    transformation_catalog_categories = list(
        filter(
            lambda d: os.path.isdir(d),
            map(
                lambda d: f"{transformation_catalog_path}/{d}",
                os.listdir(transformation_catalog_path),
            ),
        )
    )

    for tcc in transformation_catalog_categories:
        transformations = list(map(lambda tr: f"{tcc}/{tr}", os.listdir(tcc)))

        for t in transformations:
            file = open(t)
            t = json.load(file)

            try:
                get_object_by_id(
                    db=db,
                    model=transformation_catalog_models.TransformationCatalogItem,
                    object_id=t["id"],
                )
            except fastapi.exceptions.HTTPException as e:
                if e.status_code == 404:
                    create_transformation_catalog_item(
                        db=db,
                        transformation_catalog_item=transformation_catalog_schemas.TransformationCatalogItemCreate(
                            id=t["id"],
                            category=t["category"],
                            name=t["name"],
                            icon=t["icon"],
                            description=t["description"],
                            required_column_types=t["required_column_types"],
                            optional_column_types=t["optional_column_types"],
                            min_number_of_input_blocks=t["min_number_of_input_blocks"],
                            max_number_of_input_blocks=t["max_number_of_input_blocks"],
                            macro_parameters=json.dumps(t["macro_parameters"]),
                            examples_before=json.dumps(t["examples_before"]),
                            examples_after=json.dumps(t["examples_after"]),
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
