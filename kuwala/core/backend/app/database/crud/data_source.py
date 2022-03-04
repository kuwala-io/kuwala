import copy

import controller.data_source.data_source as data_source_controller
from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..database import add_and_commit_to_db
from ..models import data_source as models
from ..schemas import data_source as schemas


def get_data_source(db: Session, data_source_id: str) -> models.DataSource:
    data_source = db.get(models.DataSource, data_source_id)

    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")

    return data_source


def get_data_sources(db: Session) -> [models.DataSource]:
    return db.query(models.DataSource).all()


def create_data_source(
    db: Session, data_source: schemas.DataSourceCreate
) -> models.DataSource:
    db_data_source = models.DataSource(
        id=data_source.id,
        data_catalog_item_id=data_source.data_catalog_item_id,
        connection_parameters=data_source.connection_parameters,
        connected=data_source.connected,
    )

    add_and_commit_to_db(db=db, model=db_data_source)

    return db_data_source


def update_connection_parameters(
    db: Session, data_source_updated_connection: schemas.DataSourceConnection
) -> models.DataSource:
    data_source_id = data_source_updated_connection.id
    data_source = get_data_source(db=db, data_source_id=data_source_id)

    # Set connection parameters
    updated_connection_parameters = copy.deepcopy(data_source.connection_parameters)

    for i, connection_parameter in enumerate(updated_connection_parameters):
        updated_connection_parameters[i][
            "value"
        ] = data_source_updated_connection.connection_parameters[
            connection_parameter["id"]
        ]

    setattr(data_source, "connection_parameters", updated_connection_parameters)

    # Test connection
    dict_connection_parameters = dict(
        map(lambda p: (p["id"], p["value"]), updated_connection_parameters)
    )
    connected = data_source_controller.test_connection(
        data_source_id=data_source_id,
        connection_parameters=schemas.ConnectionParameters.parse_obj(
            dict_connection_parameters
        ),
        db=db,
    )

    setattr(data_source, "connected", connected)
    db.add(data_source)
    db.commit()
    db.refresh(data_source)

    return data_source
