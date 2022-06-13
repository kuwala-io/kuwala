import baseAxios from "./BaseAxios";

import {
    DATA_CATALOG, SELECT_DATA_CATALOG
} from "../constants/api"

export async function getAllDataCatalogItems (){
    return baseAxios.get(DATA_CATALOG);
}

export async function saveSelectedDataCatalogItems (data) {
    return baseAxios.post(SELECT_DATA_CATALOG, data);
}