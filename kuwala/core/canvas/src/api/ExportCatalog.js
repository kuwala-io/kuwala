import baseAxios from "./BaseAxios";

import {
    EXPORT_CATALOG, EXPORT_CATALOG_CATEGORY,
} from "../constants/api"

export function getAllExportCatalogCategories (){
    return baseAxios.get(EXPORT_CATALOG_CATEGORY);
}

export function getAllItemsInExportCategory (categoryId) {
    return baseAxios.get(
        `${EXPORT_CATALOG_CATEGORY}/${categoryId}/items`
    )
}