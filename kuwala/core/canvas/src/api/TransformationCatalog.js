import baseAxios from "./BaseAxios";

import {
    TRANSFORMATION_CATALOG, TRANSFORMATION_CATALOG_CATEGORY,
} from "../constants/api"

export function getAllTransformationCatalogCategories (){
    return baseAxios.get(TRANSFORMATION_CATALOG_CATEGORY);
}

export function getAllItemsInCategory (categoryId) {
    return baseAxios.get(
        `${TRANSFORMATION_CATALOG_CATEGORY}/${categoryId}/items`
    )
}