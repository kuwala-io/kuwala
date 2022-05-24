import { action, thunk } from "easy-peasy";
import {v4} from "uuid";
import {removeElements} from 'react-flow-renderer';
import {TRANSFORMATION_BLOCK, DATA_BLOCK,} from '../../../constants/nodeTypes';
import {CONNECTION_EDGE} from '../../../constants/edgeTypes';
import {
    getElementByConnectionEdgeParams,
    getElementById,
    getElementsByEntityIds,
} from "../../../utils/ElementUtils";
import {getBlockByEntityId} from "../../../utils/BlockUtils";

const CanvasModel = {
    elements: [],
    newNodeInfo: {},
    openDataView: false,
    selectedElement: null,
    // Elements
    addNode: action(({ elements }, nodeInfo) => {
        const newNode = {
            id: v4(),
            ...nodeInfo
        };

        elements.push(newNode)
    }),
    removeNodes: thunk((
        { removeConnectedEdgeFromBlock, setElements, setSelectedElement },
        { nodesToRemove, removeDataBlock, removeTransformationBlock, updateDataBlock, updateTransformationBlock },
        { getState }
    ) => {
        const { elements } = getState();

        setElements(removeElements(nodesToRemove, elements));
        nodesToRemove.forEach((nodeToRemove) => {
            if (nodeToRemove.type === DATA_BLOCK) {
                removeDataBlock(nodeToRemove.data.dataBlock.dataBlockId);
            } else if(nodeToRemove.type === TRANSFORMATION_BLOCK) {
                removeTransformationBlock(nodeToRemove.data.transformationBlock.transformationBlockId);
            } else if(nodeToRemove.type === CONNECTION_EDGE) {
                removeConnectedEdgeFromBlock({
                    source: nodeToRemove.source,
                    target: nodeToRemove.target,
                    updateDataBlock,
                    updateTransformationBlock
                });
            }
        });
        setSelectedElement(null);
    }),
    removeElementById: thunk((
        { removeNodes },
        { elementId, removeDataBlock, removeTransformationBlock, updateDataBlock, updateTransformationBlock },
        { getState }
    ) => {
        const { elements } = getState();
        const elementToRemove = getElementById(elements, elementId);

        removeNodes({
            nodesToRemove: [elementToRemove],
            removeDataBlock,
            removeTransformationBlock,
            updateDataBlock,
            updateTransformationBlock
        });
    }),
    connectNodes: thunk((
        { addConnectedEdgeToBlock, addElement },
        { params, updateDataBlock, updateTransformationBlock },
        { getState }
    ) => {
        const edgeToAdd = {
            ...params,
            animated: true,
            type: CONNECTION_EDGE,
            id: v4(),
        }
        const { elements } = getState();

        // Check if existing connections already exists
        const connectionExists = getElementByConnectionEdgeParams(elements, params);
        const { source, target } = params;
        const targetElement = getElementById(elements, target);

        if (targetElement && targetElement.type === TRANSFORMATION_BLOCK ) {
            if (
                targetElement.data.transformationBlock.connectedSourceNodeIds.length < targetElement.data.transformationCatalogItem.maxNumberOfInputBlocks &&
                !connectionExists
            ) {
                addConnectedEdgeToBlock({
                    source,
                    target,
                    updateDataBlock,
                    updateTransformationBlock
                });
                addElement(edgeToAdd);
            } else {
                alert('Maximum number of connections reached!');
            }
        }
    }),
    addConnectedEdgeToBlock: thunk((
        { addNode, setElements },
        { source, target, updateDataBlock, updateTransformationBlock },
        { getState }
    ) => {
        const { elements } = getState();
        const sourceElement = getElementById(elements, source);
        const targetElement = getElementById(elements, target);
        let sourceDTO, targetDTO;

        if (sourceElement.type === DATA_BLOCK) {
            sourceDTO = sourceElement.data.dataBlock;

            sourceDTO.connectedTargetNodeIds.push(target);
            updateDataBlock({ addNode, elements, setElements, updatedBlock: sourceDTO });
        } else if (sourceElement.type === TRANSFORMATION_BLOCK) {
            sourceDTO = sourceElement.data.transformationBlock;

            sourceDTO.connectedTargetNodeIds.push(target);
            updateTransformationBlock({ addNode, elements, setElements, updatedBlock: sourceDTO });
        }

        if(targetElement.type === DATA_BLOCK) {
            targetDTO = targetElement.data.dataBlock;
            targetDTO.connectedSourceNodeIds.push(source);
            updateDataBlock({ addNode, elements, setElements, updatedBlock: targetDTO });
        } else if (targetElement.type === TRANSFORMATION_BLOCK) {
            targetDTO = targetElement.data.transformationBlock;
            targetDTO.connectedSourceNodeIds.push(source);
            updateTransformationBlock({ addNode, elements, setElements, updatedBlock: targetDTO });
        }
    }),
    removeConnectedEdgeFromBlock: thunk((
        { addNode, setElements },
        { source, target, updateDataBlock, updateTransformationBlock },
        { getState }
    ) => {
        const { elements } = getState();
        const sourceElement = getElementById(elements, source);
        const targetElement = getElementById(elements, target);
        let sourceDTO, targetDTO;

        // Removing the targeted dto from source block
        if (sourceElement) {
            if(sourceElement.type === DATA_BLOCK) {
                sourceDTO = sourceElement.data.dataBlock;
                sourceDTO.connectedTargetNodeIds = sourceDTO.connectedTargetNodeIds.filter((el) => el !== target);
                updateDataBlock({ addNode, elements, setElements, updatedBlock: sourceDTO });
            } else if (sourceElement.type === TRANSFORMATION_BLOCK) {
                sourceDTO = sourceElement.data.transformationBlock;
                sourceDTO.connectedTargetNodeIds = sourceDTO.connectedTargetNodeIds.filter((el) => el !== target);
                updateTransformationBlock({ addNode, elements, setElements, updatedBlock: sourceDTO });
            }

        }

        // Removing the source dto from target block
        if (targetElement) {
            if (targetElement.type === DATA_BLOCK) {
                targetDTO = targetElement.data.dataBlock;
                targetDTO.connectedSourceNodeIds = targetDTO.connectedSourceNodeIds.filter((el) => el !== source);
                updateDataBlock({ addNode, elements, setElements, updatedBlock: targetDTO });
            } else if (targetElement.type === TRANSFORMATION_BLOCK) {
                targetDTO = targetElement.data.transformationBlock;
                targetDTO.connectedSourceNodeIds = targetDTO.connectedSourceNodeIds.filter((el) => el !== source);
                updateTransformationBlock({ addNode, elements, setElements, updatedBlock: targetDTO });
            }
        }
    }),
    setElements: action((state, elements) => {
        state.elements = elements
    }),
    addElement: action((state, elementToAdd) => {
        state.elements = [...state.elements, elementToAdd]
    }),
    updateElementById: thunk(({ setElements }, elementToUpdate, {getState}) => {
        const { elements } = getState();
        const { id } = elementToUpdate;
        const tmpEl = elements.map((el) => {
            if (el.id === id) {
                return elementToUpdate
            } else {
                return el
            }
        });

        setElements(tmpEl);
    }),
    setSelectedElement: action((state, selectedNode) => {
        state.selectedElement = selectedNode
    }),
    setSelectedElementByDataBlockId: action((state, selectedDataBlockId) => {
        const { elements } = state;
        const selectedElement = elements.filter((el) =>
            el.type === DATA_BLOCK && (el.data.dataBlock.dataBlockId === selectedDataBlockId)
        );

        if (!selectedElement.length) return

        state.selectedElement = selectedElement[0]
    }),
    setSelectedElementByTransformationBlockId: action((state, selectedTransformationBlockId) => {
        const { elements } = state;
        const selectedElement = elements.filter((el) =>
            el.type === TRANSFORMATION_BLOCK &&
            (el.data.transformationBlock.transformationBlockId === selectedTransformationBlockId)
        );

        if (!selectedElement.length) return

        state.selectedElement = selectedElement[0]
    }),
    setNewNodeInfo: action((state, newNodeInfo) => {
        state.newNodeInfo = newNodeInfo
    }),
    setOpenDataView: action((state, openDataView) => {
        state.openDataView = openDataView
    }),
    toggleDataView: action((state, dataView) => {
        state.openDataView = !state.openDataView
    }),
    loadConnections: thunk(async (
        { connectNodes },
        { transformationBlocks, updateDataBlock, updateTransformationBlock},
        { getState }
    ) => {
        const { elements } = getState();

        for (const tfBlock of transformationBlocks) {
            const currentElement = getBlockByEntityId(elements, tfBlock.transformationBlockEntityId);
            const connectedElements = getElementsByEntityIds(elements, tfBlock.inputBlockIds);

            for (const sourceElement of connectedElements) {
                const tmpParams = {
                    source: sourceElement.id,
                    sourceHandle: null,
                    target: currentElement.id,
                    targetHandle: null
                }

                connectNodes({ params: tmpParams, updateDataBlock, updateTransformationBlock });
            }
        }
    })
}

export default CanvasModel;