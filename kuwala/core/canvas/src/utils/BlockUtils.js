import {getElementById} from "./ElementUtils";
import {DATA_BLOCK, EXPORT_BLOCK, TRANSFORMATION_BLOCK} from "../constants/nodeTypes";

export function getDataBlockByElementId ({elements, elementId}) {
    const element = getElementById(elements, elementId);
    if (element && element.type === DATA_BLOCK) {
        return element.data.dataBlock;
    }
    return null;
}

export function getDataBlockByDataBlockId ({elements, dataBlockId}) {
    return elements.find((el) => el.type === DATA_BLOCK && el.data.dataBlock.dataBlockId === dataBlockId)
}

export function getDataBlockByDataBlockEntityId ({elements, dataBlockEntityId}) {
    return elements.find((el) => el.type === DATA_BLOCK && el.data.dataBlock.dataBlockEntityId === dataBlockEntityId)
}

export function getTransformationBlockByElementId ({elements, elementId}) {
    const element = getElementById(elements, elementId);
    if (element && element.type === TRANSFORMATION_BLOCK) {
        return element.data.transformationBlock;
    }
    return null;
}

export function getEntityElementEntityBlockId (element) {
    if (!element) return null;
    if(element.type === DATA_BLOCK) {
        return element.data.dataBlock.dataBlockEntityId
    } else if(element.type === TRANSFORMATION_BLOCK) {
        return element.data.transformationBlock.transformationBlockEntityId
    }
    return null;
}

export function getBlockByEntityId(elements, entityId) {
    const dataBlock = elements.find((el) => el.type === DATA_BLOCK && el.data.dataBlock.dataBlockEntityId === entityId);
    if (dataBlock) return dataBlock;

    const transformationBlock = elements.find((el) => el.type === TRANSFORMATION_BLOCK && el.data.transformationBlock.transformationBlockEntityId === entityId);
    if (transformationBlock) return transformationBlock;

    const exportBLock = elements.find((el) => el.type === EXPORT_BLOCK && el.data.exportBlock.exportBlockEntityId === entityId);
    if (exportBLock) return exportBLock;

    return null;
}

export function getConnectedBlockWrapper(connectedElements) {
    return connectedElements.map((el) => getEntityElementEntityBlockId(el));
}

export function updateBlockAggregator(
    {
        blockType,
        updatedBlock,
        updateDataBlock,
        updateExportBlock,
        updateTransformationBlock,
        addNode, elements, setElements,
    }
) {
    if (blockType === DATA_BLOCK) {
        updateDataBlock({ addNode, elements, setElements, updatedBlock: updatedBlock });
    } else if (blockType === TRANSFORMATION_BLOCK) {
        updateTransformationBlock({ addNode, elements, setElements, updatedBlock: updatedBlock });
    } else if (blockType === EXPORT_BLOCK) {
        updateExportBlock({ addNode, elements, setElements, updatedBlock: updatedBlock });
    }
}