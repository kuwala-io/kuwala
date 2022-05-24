import {DATA_BLOCK, TRANSFORMATION_BLOCK} from "../constants/nodeTypes";
import {CONNECTION_EDGE} from "../constants/edgeTypes";
import {getBlockByEntityId} from "./BlockUtils";

export function getElementById (elements, elementId) {
    try {
        return elements.find((el) => el.id === elementId);
    } catch (error) {
        console.error(`Couldn't find element with id ${elementId}`)
    }
}

export function getElementByIds (elements, elementIds) {
    try {
        return elements.filter((el) => elementIds.includes(el.id));
    } catch (error) {
        console.error(`Couldn't find element with ids ${elementIds}`)
    }
}

export function getElementsByEntityIds (elements, entityIds) {
    let results = [];
    for (const id of entityIds) {
        results.push(getBlockByEntityId(elements, id));
    }
    return results
}

export function getElementByConnectionEdgeParams (elements, params) {
    try {
        return elements.find((el) => el.type === CONNECTION_EDGE && el.source === params.source && el.target === params.target);
    } catch (error) {
        console.error(`Couldn't find connections`)
    }
}