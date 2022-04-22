from sqlalchemy.orm import Session

from ..database import add_and_commit_to_db
from ..models import transformation_catalog_category as models
from ..schemas import transformation_catalog_category as schemas


def create_transformation_catalog_category(
    db: Session,
    transformation_catalog_category: schemas.TransformationCatalogCategoryCreate,
) -> models.TransformationCatalogCategory:
    db_transformation_catalog_category = models.TransformationCatalogCategory(
        id=transformation_catalog_category.id,
        name=transformation_catalog_category.name,
        icon=transformation_catalog_category.icon,
    )

    add_and_commit_to_db(db=db, model=db_transformation_catalog_category)

    return db_transformation_catalog_category
