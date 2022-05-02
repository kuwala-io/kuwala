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