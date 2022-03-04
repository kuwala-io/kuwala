from sqlalchemy.orm import Session

from ..database import add_and_commit_to_db
from ..models import data_source as models
from ..schemas import data_source as schemas


def get_data_source(db: Session, data_source_id: str) -> models.DataSource:
    return (
        db.query(models.DataSource)
        .filter(models.DataSource.id == data_source_id)
        .first()
    )


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
