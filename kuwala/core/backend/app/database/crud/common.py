import uuid

from database.database import Base
from fastapi import HTTPException
from sqlalchemy.orm import Session


def generate_object_id() -> str:
    return str(uuid.uuid4()).replace("-", "")


def get_object_by_id(db: Session, model: Base, object_id: str) -> Base:
    db_object = db.get(model, object_id)

    if not db_object:
        raise HTTPException(
            status_code=404,
            detail=f"Object of type {model} and ID {object_id} not found",
        )

    return db_object


def get_all_objects(db: Session, model: Base) -> [Base]:
    return db.query(model).all()


def update_attributes(db: Session, db_object: Base, attributes: [dict]) -> Base:
    for attribute in attributes:
        setattr(db_object, attribute["name"], attribute["value"])

    db.add(db_object)
    db.commit()
    db.refresh(db_object)

    return db_object
