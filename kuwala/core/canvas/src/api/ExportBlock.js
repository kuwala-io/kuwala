import baseAxios from "./BaseAxios";

import {
    EXPORT_BLOCK,
    TRANSFORMATION_BLOCK,
} from "../constants/api"

export async function createExportBlock (data){
    return baseAxios.post(EXPORT_BLOCK, data);
}

export async function triggerExportBlock ({exportBlockId}){
    return baseAxios.get(
        `${EXPORT_BLOCK}/${exportBlockId}/trigger`,
    )
}

export async function updateExportBlockEntity ({exportBlockEntityId, data}) {
    return baseAxios.put(
        `${EXPORT_BLOCK}/${exportBlockEntityId}`,
        data
    );
}