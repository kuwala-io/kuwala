import baseAxios from "./BaseAxios";

import {
    TRANSFORMATION_BLOCK,
} from "../constants/api"

export function createTransformationBlock (data){
    return baseAxios.post(TRANSFORMATION_BLOCK, data);
}

export function getTransformationBlockPreview ({transformationBlockId, params}){
    return baseAxios.get(
        `${TRANSFORMATION_BLOCK}/${transformationBlockId}/preview`,
        {params}
    )
}

export function updateTransformationBlockColumns ({transformationBlockId, data}) {
    return baseAxios.put(
        `${TRANSFORMATION_BLOCK}/${transformationBlockId}`,
        data
    );
}

export function refreshTransformationBlock ({transformationBlockId}) {
    return baseAxios.put(
        `${TRANSFORMATION_BLOCK}/${transformationBlockId}/refresh`
    );
}