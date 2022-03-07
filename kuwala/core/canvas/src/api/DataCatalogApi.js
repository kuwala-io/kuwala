import baseAxios from "./BaseAxios";

import {
    DATA_CATALOG, SELECT_DATA_CATALOG
} from "../constants/api"

export function getAllDataCatalog (){
    return baseAxios.get(DATA_CATALOG);
}

export function saveSelectedSources (data) {
    return baseAxios.post(SELECT_DATA_CATALOG, data);
}