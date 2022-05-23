import {DATA_BLOCK, TRANSFORMATION_BLOCK} from "../constants/nodeTypes";
import {CONNECTION_EDGE} from "../constants/edgeTypes";

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

export function getElementByDataBlockEntityId (elements, dataBlockEntityId) {
    try {
        return elements.filter((el) => el.type === DATA_BLOCK && el.data.dataBlock.dataBlockEntityId === dataBlockEntityId);
    } catch (error) {
        console.error(`Couldn't find element with id ${dataBlockEntityId}`)
    }
}

export function getElementsByDataBlockEntityIds (elements, dataBlockEntityIds) {
    try {
        const filtered = elements.filter((el) => {
            return el.type === DATA_BLOCK && dataBlockEntityIds.includes(el.data.dataBlock.dataBlockEntityId);
        });
        return [...filtered];
    } catch (error) {
        console.error(`Couldn't find element in ids ${dataBlockEntityIds}`)
    }
}

export function getElementsByTransformationBlockEntityIds (elements, transformationBlockEntityIds) {
    try {
        const filtered = elements.filter((el) => el.type === TRANSFORMATION_BLOCK && transformationBlockEntityIds.includes(el.data.transformationBlock.transformationBlockEntityId));
        return [...filtered];
    } catch (error) {
        console.error(`Couldn't find element in ids ${transformationBlockEntityIds}`)
    }
}

export function getElementByTransformationBlockEntityId (elements, transformationBlockId) {
    try {
        return elements.find((el) => el.type === TRANSFORMATION_BLOCK && el.data.transformationBlock.transformationBlockEntityId === transformationBlockId);
    } catch (error) {
        console.error(`Couldn't find element with transformationBlockEntityId ${transformationBlockId}`)
    }
}

export function getElementByConnectionEdgeParams (elements, params) {
    try {
        return elements.find((el) => el.type === CONNECTION_EDGE && el.source === params.source && el.target === params.target);
    } catch (error) {
        console.error(`Couldn't find connections`)
    }
}