import baseAxios from "./BaseAxios";

import {
    DATA_BLOCK,
} from "../constants/api"

export async function createNewDataBlock(data) {
    return baseAxios.post(DATA_BLOCK, data);
}

export async function updateDataBlockEntity(dataBlockId, data) {
    return baseAxios.put(`${DATA_BLOCK}/${dataBlockId}`, data);
}

export async function getDataBlockPreview({dataBlockId, params}) {
    return baseAxios.get(
        `${DATA_BLOCK}/${dataBlockId}/preview`,
        {params}
    )
}

export async function deleteDataBlock({dataBlockId}) {
    return baseAxios.delete(`${DATA_BLOCK}/${dataBlockId}`)
}
