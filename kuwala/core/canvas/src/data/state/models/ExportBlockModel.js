import {action, thunk} from "easy-peasy";
import {EXPORT_BLOCK} from "../../../constants/nodeTypes";
import {getNodeTypeByDataCatalogId} from "../utils";
import ExportBlockDTO from "../../dto/ExportBlockDTO";

const ExportBlockModel = {
    exportBlocks: [],

    setExportBlocks: action((state, exportBlocks) => {
        state.exportBlocks = exportBlocks;
    }),

    addExportBlock: action((state, newExportBlock) => {
        state.exportBlocks = [...state.exportBlocks, newExportBlock]
    }),

    updateNodePayloadByExportBlock: thunk(async (
        actions,
        { elements, setElements, exportBlockId, updatedNodeInfo }
    ) => {
        setElements(elements.map((el) => {
            if (el.type !== EXPORT_BLOCK) return el

            if (el.data.exportBlock.exportBlockId === exportBlockId) {
                return {
                    ...el,
                    data: updatedNodeInfo.data,
                    position: {
                        x: updatedNodeInfo.data.exportBlock.positionX || el.position.x,
                        y: updatedNodeInfo.data.exportBlock.positionY || el.position.y
                    }
                }
            } else {
                return el
            }
        }));
    }),

    convertExportBlockIntoElement: thunk(async (
        { updateNodePayloadByExportBlock },
        { addNode, elements, setElements },
        { getState }
    ) => {
        const { exportBlocks } = getState();

        exportBlocks.forEach((block) => {
            let dupeFlag = false;

            // Check if export block already converted into node
            elements.forEach((curEl) => {
                if (curEl.type !== EXPORT_BLOCK) return;
                if ((curEl.data.exportBlock.exportBlockId === block.exportBlockId)) dupeFlag = true;
                if ((curEl.data.exportBlock.exportBlockEntityId === block.exportBlockEntityId)) dupeFlag = true;
            });

            const nodeInfo = {
                type: getNodeTypeByDataCatalogId('export'),
                data: {
                    label: block.exportCatalogItem.name,
                    exportCatalogItem: block.exportCatalogItem,
                    exportBlock: {...block},
                },
                sourcePosition: 'right',
                targetPosition: 'left',
            }

            if (dupeFlag) {
                // If node same node exists -> Update the node info
                updateNodePayloadByExportBlock({
                    elements,
                    setElements,
                    exportBlockId: block.exportBlockId,
                    updatedNodeInfo: nodeInfo
                })
            } else {
                // Else add new node
                let position = {
                    x: 400,
                    y: 400,
                };

                if (nodeInfo.data.exportBlock.positionX && nodeInfo.data.exportBlock.positionY) {
                    position = {
                        x: nodeInfo.data.exportBlock.positionX,
                        y: nodeInfo.data.exportBlock.positionY
                    }
                }

                addNode({ ...nodeInfo, position });
            }
        });
    }),

    updateExportBlock: thunk((
        { convertExportBlockIntoElement, setExportBlocks },
        { addNode, elements, setElements, updatedBlock },
        { getState }
    ) => {
        const { exportBlocks } = getState();
        const blocks = exportBlocks.map((curEl) => {
            const { exportBlockId } = updatedBlock;

            if (curEl.exportBlockId === exportBlockId) {
                return new ExportBlockDTO({...updatedBlock});
            } else {
                return curEl;
            }
        });

        setExportBlocks(blocks);
        convertExportBlockIntoElement({ addNode, elements, setElements });
    }),

    updateExportBlockPosition: thunk((
        { setExportBlocks },
        { exportBlockId, positionX, positionY },
        { getState }
    ) => {
        const { exportBlocks } = getState();
        const blocks = exportBlocks.map((element) => {
            if (element.exportBlockId === exportBlockId) {
                return new ExportBlockDTO({ ...element, positionX, positionY });
            } else {
                return element
            }
        });

        setExportBlocks(blocks);
    }),

    removeExportBlock: thunk((
        { setExportBlocks },
        exportBlockId,
        { getState }
    ) => {
        const { exportBlocks } = getState();

        setExportBlocks(exportBlocks.filter((el) => el.exportBlockId !== exportBlockId));
    }),
}

export default ExportBlockModel