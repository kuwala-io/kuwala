import database.crud.data_source as crud_data_source
from database.database import get_db
from database.schemas.data_source import ConnectionParameters
from fastapi import Depends, HTTPException
import postgres as postgres_controller
from sqlalchemy.orm import Session


def test_connection(
    data_source_id: str,
    connection_parameters: ConnectionParameters,
    db: Session = Depends(get_db),
):
    data_source = crud_data_source.get_data_source(db=db, data_source_id=data_source_id)

    if not data_source:
        raise HTTPException(
            status_code=404, detail=f"No data source found with ID {data_source_id}."
        )

    data_catalog_item_id = data_source.data_catalog_item_id

    if data_catalog_item_id == "postgres":
        connected = postgres_controller.test_connection(
            connection_parameters=connection_parameters
        )

        if not connected:
            return False

        return True
    else:
        raise HTTPException(
            status_code=404,
            detail=f"No matching data catalog item found for data source {data_catalog_item_id}",
        )
