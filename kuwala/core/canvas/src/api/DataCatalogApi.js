import baseAxios from "./BaseAxios";

import {
    DATA_CATALOG, SELECT_DATA_CATALOG
} from "../constants/api"

export function getAllDataCatalogItems (){
    return baseAxios.get(DATA_CATALOG);
}

export function saveSelectedDataCatalogItems (data) {
    return baseAxios.post(SELECT_DATA_CATALOG, data);
}