import baseAxios from "./BaseAxios";

import {
    DATA_BLOCK,
} from "../constants/api"

export function createNewDataBlock (data) {
    return baseAxios.post(DATA_BLOCK, data);
}

export function updateDataBlockEntity (data) {
    return baseAxios.put(DATA_BLOCK, data);
}

export function getDataBlockPreview ({dataBlockId, params}){
    return baseAxios.get(
        `${DATA_BLOCK}/${dataBlockId}/preview`,
        {params}
    )
}
