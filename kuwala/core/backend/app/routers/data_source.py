import controller.postgres as postgres_controller
from database.crud.data_source import get_data_source, get_data_sources
from database.database import get_db
from database.schemas.data_source import ConnectionParameters, DataSource
from database.utils.encoder import list_props_to_json_props
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/data-source",
    tags=["data_source"],
    responses={400: {"description": "Bad request"}, 404: {"description": "Not found"}},
)


@router.get("/", response_model=list[DataSource])
def get_all_data_sources(db: Session = Depends(get_db)):
    data_sources = get_data_sources(db)
    data_sources = list(
        map(
            lambda data_source: list_props_to_json_props(
                base_object=data_source, list_parameters=["connection_parameters"]
            ),
            data_sources,
        )
    )

    return data_sources


@router.post("/{data_source_id}/connection/test")
def test_connection(
    data_source_id: str,
    connection_parameters: ConnectionParameters,
    db: Session = Depends(get_db),
):
    data_source = get_data_source(db=db, data_source_id=data_source_id)

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
            return {"connected": False}

        return {"connected": True}
    else:
        raise HTTPException(
            status_code=404,
            detail=f"No matching data catalog item found for data source {data_catalog_item_id}",
        )
