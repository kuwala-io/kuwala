import baseAxios from "./BaseAxios";

import {
    TRANSFORMATION_CATALOG,
} from "../constants/api"

export function getAllTransformationCatalog (){
    return baseAxios.get(TRANSFORMATION_CATALOG);
}

export function getAllItemsFromTransformationCategories (transformationId) {
    return baseAxios.get(
        `${TRANSFORMATION_CATALOG}/${transformationId}/items`
    )
}