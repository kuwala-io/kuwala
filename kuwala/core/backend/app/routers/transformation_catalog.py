from database.crud.common import get_all_objects
from database.database import get_db
import database.models.transformation_catalog as models_transformation_catalog
import database.models.transformation_catalog_category as models_transformation_catalog_category
import database.schemas.transformation_catalog as schemas_transformation_catalog
import database.schemas.transformation_catalog_category as schemas_transformation_catalog_category
from database.utils.encoder import list_props_to_json_props
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/transformation-catalog",
    tags=["transformation_catalog"],
)


@router.get(
    "/category",
    response_model=list[
        schemas_transformation_catalog_category.TransformationCatalogCategory
    ],
)
def get_all_transformation_categories(db: Session = Depends(get_db)):
    return get_all_objects(
        db=db,
        model=models_transformation_catalog_category.TransformationCatalogCategory,
    )


@router.get(
    "/category/{category_id}/items",
    response_model=list[schemas_transformation_catalog.TransformationCatalogItem],
)
def get_all_transformation_category_items(
    category_id: str, db: Session = Depends(get_db)
):
    items = get_all_objects(
        db=db,
        model=models_transformation_catalog.TransformationCatalogItem,
        where=f"category = '{category_id}'",
    )
    items = list(
        map(
            lambda item: list_props_to_json_props(
                base_object=item,
                list_parameters=[
                    "examples_before",
                    "examples_after",
                    "macro_parameters",
                ],
            ),
            items,
        )
    )

    return items
