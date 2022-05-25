from sqlalchemy.orm import Session

from ..database import add_and_commit_to_db
from ..models import export_catalog_category as models
from ..schemas import export_catalog_category as schemas


def create_export_catalog_category(
    db: Session,
    export_catalog_category: schemas.ExportCatalogCategoryCreate,
) -> models.ExportCatalogCategory:
    db_export_catalog_category = models.ExportCatalogCategory(
        id=export_catalog_category.id,
        name=export_catalog_category.name,
        icon=export_catalog_category.icon,
    )

    add_and_commit_to_db(db=db, model=db_export_catalog_category)

    return db_export_catalog_category
