from database.crud.common import get_all_objects
from database.database import get_db
import database.models.export_catalog as models_export_catalog
import database.models.export_catalog_category as models_export_catalog_category
import database.schemas.export_catalog as schemas_export_catalog
import database.schemas.export_catalog_category as schemas_export_catalog_category
from database.utils.encoder import list_props_to_json_props
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/export-catalog",
    tags=["export_catalog"],
)


@router.get(
    "/category",
    response_model=list[
        schemas_export_catalog_category.ExportCatalogCategory
    ],
)
def get_all_export_categories(db: Session = Depends(get_db)):
    return get_all_objects(
        db=db,
        model=models_export_catalog_category.ExportCatalogCategory,
    )


@router.get(
    "/category/{category_id}/items",
    response_model=list[schemas_export_catalog.ExportCatalogItem],
)
def get_all_export_category_items(
    category_id: str, db: Session = Depends(get_db)
):
    items = get_all_objects(
        db=db,
        model=models_export_catalog.ExportCatalogItem,
        where=f"category = '{category_id}'",
    )
    items = list(
        map(
            lambda item: list_props_to_json_props(
                base_object=item,
                list_parameters=[
                    "macro_parameters",
                ],
            ),
            items,
        )
    )

    return items
