import {action, thunk} from "easy-peasy";
import {TRANSFORMATION_BLOCK} from "../../../constants/nodeTypes";
import {getNodeTypeByDataCatalogId} from "../utils";
import TransformationBlockDTO from "../../dto/TransformationBlockDTO";

const TransformationBlockModel = {
    transformationBlocks: [],
    setTransformationBlocks: action((state, transformationBlocks) => {
        state.transformationBlocks = transformationBlocks;
    }),
    updateNodePayloadByTransformationBlock: thunk(async (
        actions,
        { elements, setElements, transformationBlockId, updatedNodeInfo }
    ) => {
        setElements(elements.map((el) => {
            if (el.type !== TRANSFORMATION_BLOCK) return el

            if (el.data.transformationBlock.transformationBlockId === transformationBlockId) {
                return {
                    ...el,
                    data: updatedNodeInfo.data,
                    position: {
                        x: updatedNodeInfo.data.transformationBlock.positionX || el.position.x,
                        y: updatedNodeInfo.data.transformationBlock.positionY || el.position.y
                    }
                }
            } else {
                return el
            }
        }));
    }),
    convertTransformationBlockIntoElement: thunk(async (
        { updateNodePayloadByTransformationBlock },
        { addNode, elements, setElements },
        { getState }
    ) => {
        const { transformationBlocks } = getState();

        transformationBlocks.forEach((block) => {
            let dupeFlag = false;

            // Check if transformation block already converted into node
            elements.forEach((curEl) => {
                if (curEl.type !== TRANSFORMATION_BLOCK) return;
                if ((curEl.data.transformationBlock.transformationBlockId === block.transformationBlockId)) dupeFlag = true;
                if ((curEl.data.transformationBlock.transformationBlockEntityId === block.transformationBlockEntityId)) dupeFlag = true;
            });

            const nodeInfo = {
                type: getNodeTypeByDataCatalogId('transformation'),
                data: {
                    label: block.transformationCatalogItem.name,
                    transformationCatalogItem: block.transformationCatalogItem,
                    transformationBlock: {...block},
                },
                sourcePosition: 'right',
                targetPosition: 'left',
            }

            if (dupeFlag) {
                // If node same node exists -> Update the node info
                updateNodePayloadByTransformationBlock({
                    elements,
                    setElements,
                    transformationBlockId: block.transformationBlockId,
                    updatedNodeInfo: nodeInfo
                })
            } else {
                // Else add new node
                let position = {
                    x: 400,
                    y: 400,
                };

                if (nodeInfo.data.transformationBlock.positionX && nodeInfo.data.transformationBlock.positionY) {
                    position = {
                        x: nodeInfo.data.transformationBlock.positionX,
                        y: nodeInfo.data.transformationBlock.positionY
                    }
                }

                addNode({ ...nodeInfo, position });
            }
        });
    }),
    addTransformationBlock: action((state, newTransformationBlock) => {
        state.transformationBlocks = [...state.transformationBlocks, newTransformationBlock]
    }),
    updateTransformationBlock: thunk((
        { convertTransformationBlockIntoElement, setTransformationBlocks },
        { addNode, elements, setElements, updatedBlock },
        { getState }
    ) => {
        const { transformationBlocks } = getState();
        const blocks = transformationBlocks.map((curEl) => {
            const { transformationBlockId } = updatedBlock;

            if (curEl.transformationBlockId === transformationBlockId) {
                return new TransformationBlockDTO({...updatedBlock});
            } else {
                return curEl;
            }
        });

        setTransformationBlocks(blocks);
        convertTransformationBlockIntoElement({ addNode, elements, setElements });
    }),
    updateTransformationBlockPosition: thunk((
        { setTransformationBlocks },
        { transformationBlockId, positionX, positionY },
        { getState }
    ) => {
        const { transformationBlocks } = getState();
        const blocks = transformationBlocks.map((element) => {
            if (element.transformationBlockId === transformationBlockId) {
                return new TransformationBlockDTO({ ...element, positionX, positionY });
            } else {
                return element
            }
        });

        setTransformationBlocks(blocks);
    }),
    removeTransformationBlock: thunk((
        { setTransformationBlocks },
        transformationBlockId,
        { getState }
    ) => {
        const { transformationBlocks } = getState();

        setTransformationBlocks(transformationBlocks.filter((el) => el.transformationBlockId !== transformationBlockId));
    }),
};

export default TransformationBlockModel;
