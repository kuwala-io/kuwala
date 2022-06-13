from database.database import Base
from fastapi import HTTPException
import shortuuid
from sqlalchemy.orm import Session
from sqlalchemy.sql import text


def generate_object_id() -> str:
    return shortuuid.ShortUUID().random(length=6).lower()


def get_object_by_id(db: Session, model: Base, object_id: str) -> Base:
    db_object = db.get(model, object_id)

    if not db_object:
        raise HTTPException(
            status_code=404,
            detail=f"Object of type {model} and ID {object_id} not found",
        )

    return db_object


def get_all_objects(db: Session, model: Base, where: str = None) -> [Base]:
    if where is not None:
        return db.query(model).where(text(where)).all()

    return db.query(model).all()


def update_attributes(db: Session, db_object: Base, attributes: [dict]) -> Base:
    for attribute in attributes:
        setattr(db_object, attribute["name"], attribute["value"])

    db.add(db_object)
    db.commit()
    db.refresh(db_object)

    return db_object


def delete_object(db: Session, model: Base, object_id: str):
    db_object = get_object_by_id(db=db, model=model, object_id=object_id)

    db.delete(db_object)
    db.commit()
