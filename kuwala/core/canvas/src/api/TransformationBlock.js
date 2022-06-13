import baseAxios from "./BaseAxios";

import {
    TRANSFORMATION_BLOCK,
} from "../constants/api"

export async function createTransformationBlock (data){
    return baseAxios.post(TRANSFORMATION_BLOCK, data);
}

export async function getTransformationBlockPreview ({transformationBlockId, params}){
    return baseAxios.get(
        `${TRANSFORMATION_BLOCK}/${transformationBlockId}/preview`,
        {params}
    )
}

export async function updateTransformationBlockEntity ({transformationBlockId, data}) {
    return baseAxios.put(
        `${TRANSFORMATION_BLOCK}/${transformationBlockId}`,
        data
    );
}

export async function refreshTransformationBlock ({transformationBlockId}) {
    return baseAxios.put(
        `${TRANSFORMATION_BLOCK}/${transformationBlockId}/refresh`
    );
}

export async function deleteTransformationBlock({transformationBlockId}) {
    return baseAxios.delete(`${TRANSFORMATION_BLOCK}/${transformationBlockId}`)
}
