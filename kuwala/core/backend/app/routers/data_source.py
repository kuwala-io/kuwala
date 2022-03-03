from database.crud.data_source import get_data_sources
from database.database import get_db
from database.schemas.data_source import DataSource
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from utils.encoder import list_props_to_json_props

router = APIRouter(
    prefix="/data-source",
    tags=["data_source"],
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
