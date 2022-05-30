import { action, thunk } from "easy-peasy";
import {v4} from "uuid";
import {removeElements, addEdge} from 'react-flow-renderer'

import {getAllDataCatalogItems, saveSelectedDataCatalogItems} from '../../../api/DataCatalogApi';
import {getDataSource} from '../../../api/DataSourceApi';

import DataSourceDTO from '../../dto/DataSourceDTO';
import TransformationBlockDTO from '../../dto/TransformationBlockDTO';
import DataBlockDTO from '../../dto/DataBlockDTO';
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
    selectedElement: null,
    selectedTransformationBlock: null,
    newNodeInfo: {},
    openDataView: false,
    dataSource: [],
    availableDataSource: [],
    selectedDataSource: [],
    canvasSelectedDataSource: [],
    selectedColumnAddress: [],
    selectedAddressObj: {},
    dataBlocks: [],
    transformationBlocks: [],

    // Elements
    addNode: action((state, nodeInfo) => {
        const newNode = {
            id: v4(),
            ...nodeInfo
        };
        state.elements.push(newNode)
    }),

    updateNodePayloadByDataBlock: action((state, {updatedNodeInfo, dataBlockId}) => {
        const tempElement = state.elements;
        const updatedElements = tempElement.map((el) => {
            if (el.type !== DATA_BLOCK) return el
            if (el.data.dataBlock.dataBlockId === dataBlockId) {
                return {
                    ...el,
                    data: updatedNodeInfo.data
                }
            } else {
                return el
            }
        })
        state.elements = updatedElements
    }),

    updateNodePayloadByTransformationBlock: action((state, {updatedNodeInfo, transformationBlockId}) => {
        const tempElement = state.elements;
        const updatedElements = tempElement.map((el) => {
            if (el.type !== TRANSFORMATION_BLOCK) return el
            if (el.data.transformationBlock.transformationBlockId === transformationBlockId) {
                return {
                    ...el,
                    data: updatedNodeInfo.data
                }
            } else {
                return el
            }
        })
        state.elements = updatedElements
    }),

    convertDataBlocksIntoElement: thunk(async (actions, nodeToRemove, {getState}) => {
        const {dataBlocks, elements} = getState();
        dataBlocks.forEach((block) => {
            let dupeFlag = false;

            // Check if Data block already converted into node
            elements.forEach((curEl) => {
                if (curEl.type !== DATA_BLOCK) return;
                if (curEl.data.dataBlock.dataBlockId === block.dataBlockId) dupeFlag = true;
                if ((curEl.data.dataBlock.dataBlockEntityId === block.dataBlockEntityId) && block.dataBlockEntityId !== null) dupeFlag = true;
            });

            const nodeInfo = {
                type: getNodeTypeByDataCatalogId(block.dataCatalogType),
                data: {
                    label: getLabelByDataCatalogId(block.dataCatalogType),
                    dataSource: block.dataSourceDTO,
                    dataBlock: {...block},
                },
                sourcePosition: 'right',
            }

            if (dupeFlag) {
                // If node same node exists -> Update the node info
                actions.updateNodePayloadByDataBlock({updatedNodeInfo: nodeInfo, dataBlockId: block.dataBlockId})
            } else {
                // Else add new node
                let position = {
                    x: -100,
                    y: Math.random() * window.innerHeight / 2,
                };

                if(nodeInfo.data.dataBlock.positionX && nodeInfo.data.dataBlock.positionY) {
                    position = {
                        x: nodeInfo.data.dataBlock.positionX,
                        y: nodeInfo.data.dataBlock.positionY
                    }
                }

                actions.addNode({
                    ...nodeInfo,
                    position
                })
            }
        });
    }),

    convertTransformationBlockIntoElement: thunk(async (actions, nodeToRemove, {getState}) => {
        const {transformationBlocks, elements} = getState();
        transformationBlocks.forEach((block) => {
            let dupeFlag = false;

            // Check if Data block already converted into node
            elements.forEach((curEl) => {
                if (curEl.type !== TRANSFORMATION_BLOCK) return;
                if ((curEl.data.transformationBlock.transformationBlockId === block.transformationBlockId)) dupeFlag = true;
                if ((curEl.data.transformationBlock.transformationBlockEntityId === block.transformationBlockEntityId) && block.transformationBlockEntityId !== null) {
                    dupeFlag = true
                }
            });

            const nodeInfo = {
                type: getNodeTypeByDataCatalogId('transformation'),
                data: {
                    label: block.transformationCatalog.name,
                    transformationCatalog: block.transformationCatalog,
                    transformationBlock: {...block},
                },
                sourcePosition: 'right',
                targetPosition: 'left',
            }

            if (dupeFlag) {
                // If node same node exists -> Update the node info
                actions.updateNodePayloadByTransformationBlock({
                    updatedNodeInfo: nodeInfo,
                    transformationBlockId: block.transformationBlockId
                })
            } else {
                // Else add new node

                let position = {
                    x: -100,
                    y: Math.random() * window.innerHeight / 2,
                };

                if(nodeInfo.data.transformationBlock.positionX && nodeInfo.data.transformationBlock.positionY) {
                    position = {
                        x: nodeInfo.data.transformationBlock.positionX,
                        y: nodeInfo.data.transformationBlock.positionY
                    }
                }

                actions.addNode({
                    ...nodeInfo,
                    position,
                })
            }
        });
    }),
    removeNode: thunk((actions, nodesToRemove, {getState}) => {
        actions.setElements(removeElements(nodesToRemove, getState().elements))
        nodesToRemove.forEach((nodeToRemove) => {
            if(nodeToRemove.type === DATA_BLOCK) {
                actions.removeDataBlock(nodeToRemove.data.dataBlock.dataBlockId);
            } else if(nodeToRemove.type === TRANSFORMATION_BLOCK) {
                actions.removeTransformationBlock(nodeToRemove.data.transformationBlock.transformationBlockId);
            } else if(nodeToRemove.type === CONNECTION_EDGE) {
                actions.removeConnectedEdgeFromBlock({
                   source: nodeToRemove.source,
                   target: nodeToRemove.target,
                });
            }
        });
        actions.setSelectedElement(null)
    }),
    removeElementById: thunk((actions, elementId, {getState}) => {
        const elementToRemove = getElementById(getState().elements, elementId);
        actions.removeNode([elementToRemove]);
    }),
    connectNodes: thunk((actions, params, {getState}) => {
        const edgeToAdd = {
            ...params,
            animated: true,
            type: CONNECTION_EDGE,
            id: v4(),
        }
        const elements = getState().elements;

        // Check if existing connections already exists
        const connectionExists = getElementByConnectionEdgeParams(elements, params);
        const target = getElementById(elements, params.target);
        if(target && target.type === TRANSFORMATION_BLOCK ) {
            if(target.data.transformationBlock.connectedSourceNodeIds.length < target.data.transformationCatalog.maxNumberOfInputBlocks && !connectionExists) {
                actions.addConnectedEdgeToBlock({
                    source: params.source,
                    target: params.target
                });
                actions.addElement(edgeToAdd);
            } else {
                alert('Maximum number of connections reached!');
            }
        }
    }),

    addConnectedEdgeToBlock: thunk((actions, {source, target}, {getState}) => {
        const sourceElement = getElementById(getState().elements, source);
        const targetElement = getElementById(getState().elements, target);

        let sourceDTO, targetDTO;
        if(sourceElement.type === DATA_BLOCK) {
            sourceDTO = sourceElement.data.dataBlock;
            sourceDTO.connectedTargetNodeIds.push(target);
            actions.updateDataBlock(sourceDTO);
        } else if (sourceElement.type === TRANSFORMATION_BLOCK) {
            sourceDTO = sourceElement.data.transformationBlock;
            sourceDTO.connectedTargetNodeIds.push(target);
            actions.updateTransformationBlock(sourceDTO);
        }

        if(targetElement.type === DATA_BLOCK) {
            targetDTO = targetElement.data.dataBlock;
            targetDTO.connectedSourceNodeIds.push(source);
            actions.updateDataBlock(targetDTO);
        } else if (targetElement.type === TRANSFORMATION_BLOCK) {
            targetDTO = targetElement.data.transformationBlock;
            targetDTO.connectedSourceNodeIds.push(source);
            actions.updateTransformationBlock(targetDTO);
        }
    }),

    removeConnectedEdgeFromBlock: thunk((actions, {source, target}, {getState}) => {
        const sourceElement = getElementById(getState().elements, source);
        const targetElement = getElementById(getState().elements, target);
        let sourceDTO, targetDTO;

        // Removing the targeted dto from source block
        if(sourceElement) {
            if(sourceElement.type === DATA_BLOCK) {
                sourceDTO = sourceElement.data.dataBlock;
                sourceDTO.connectedTargetNodeIds = sourceDTO.connectedTargetNodeIds.filter((el) => el !== target);
                actions.updateDataBlock(sourceDTO);
            } else if (sourceElement.type === TRANSFORMATION_BLOCK) {
                sourceDTO = sourceElement.data.transformationBlock;
                sourceDTO.connectedTargetNodeIds = sourceDTO.connectedTargetNodeIds.filter((el) => el !== target);
                actions.updateTransformationBlock(sourceDTO);
            }

        }

        // Removing the source dto from target block
        if(targetElement) {
            if(targetElement.type === DATA_BLOCK) {
                targetDTO = targetElement.data.dataBlock;
                targetDTO.connectedSourceNodeIds = targetDTO.connectedSourceNodeIds.filter((el) => el !== source);
                actions.updateDataBlock(targetDTO);
            } else if (targetElement.type === TRANSFORMATION_BLOCK) {
                targetDTO = targetElement.data.transformationBlock;
                targetDTO.connectedSourceNodeIds = targetDTO.connectedSourceNodeIds.filter((el) => el !== source);
                actions.updateTransformationBlock(targetDTO);
            }
        }
    }),

    setElements: action((state, elements) => {
        state.elements = elements
    }),
    addElement: action((state, elementToAdd) => {
        state.elements = [...state.elements, elementToAdd]
    }),
    updateElementById: thunk((actions, elementToUpdate, {getState}) => {
        const {elements} = getState();
        const tempEl = elements.map((el) => {
            if (el.id === elementToUpdate.id) {
                const updatedEl = elementToUpdate
                return updatedEl
            } else {
                return el
            }
        });
        actions.setElements(tempEl);
    }),
    setSelectedElement: action((state, selectedNode) => {
        state.selectedElement = selectedNode
    }),
    setSelectedElementByDataBlockId: action((state, selectedDataBlockId) => {
        const selectedElement = state.elements.filter((el) => el.type === DATA_BLOCK && (el.data.dataBlock.dataBlockId === selectedDataBlockId));
        if (!selectedElement.length) return
        state.selectedElement = selectedElement[0]
    }),
    setSelectedElementByTransformationBlockId: action((state, selectedTransformationBlockId) => {
        const selectedElement = state.elements.filter((el) => el.type === TRANSFORMATION_BLOCK && (el.data.transformationBlock.transformationBlockId === selectedTransformationBlockId));
        if (!selectedElement.length) return
        state.selectedElement = selectedElement[0]
    }),
    setNewNodeInfo: action((state, newNodeInfo) => {
        state.newNodeInfo = newNodeInfo
    }),

    // TODO: Handle set selected transformation block on click
    setSelectedTransformationBlock: action((state, selectedTransformationBlockId) => {

    }),

    setOpenDataView: action((state, openDataView) => {
        state.openDataView = openDataView
    }),
    toggleDataView: action((state, dataView) => {
        state.openDataView = !state.openDataView
    }),

    // Data Sources
    addDataSource: action((state, dataSource) => {
        state.dataSource = [...state.dataSource, ...dataSource]
    }),
    setDataSource: action((state, dataSource) => {
        state.dataSource = dataSource
    }),
    getDataSources: thunk(async (actions, params, {getState}) => {
        const result = await getDataSource();
        await actions.getAvailableDataSource();
        const dataCatalog = getState().availableDataSource;

        const DTOs = [];

        result.data.forEach((e, i) => {
            const data_catalog_item_id = e.data_catalog_item_id;
            const index = dataCatalog.findIndex((e, i) => {
                if (e.id === data_catalog_item_id) return true
            });
            const dto = new DataSourceDTO({
                id: e.id,
                dataCatalogItemId: e.data_catalog_item_id,
                connectionParameters: e.connection_parameters,
                logo: dataCatalog[index].logo,
                name: dataCatalog[index].name,
                connected: e.connected,
            });
            DTOs.push(dto);
        });

        actions.setDataSource(DTOs)
    }),

    // Data Catalog
    setAvailableDataSource: action((state, newAvailableSource) => {
        state.availableDataSource = newAvailableSource
    }),

    getAvailableDataSource: thunk(async (actions) => {
        const response = await getAllDataCatalogItems();
        if (response.status === 200) {
            const data = response.data
            actions.setAvailableDataSource(data)
        } else {
            actions.setAvailableDataSource([])
        }
    }),


    // Selected Data Sources
    setSelectedSources: action((state, newSelectedSources) => {
        state.selectedDataSource = newSelectedSources
    }),
    saveSelectedSources: thunk(async (actions, params, {getState}) => {
        const selectedSource = getState().selectedDataSource;

        if (!selectedSource.length) {
            console.error("Selected source is empty")
            return;
        }
        const idList = selectedSource.map((el) => el.id);
        await saveSelectedDataCatalogItems({
            item_ids: idList
        });
        actions.getDataSources()
    }),

    // Canvas Selected Data Source
    addDataSourceToCanvas: action((state, selectedDataSource) => {
        let dupe = false;
        state.canvasSelectedDataSource.forEach((el) => {
            if (el.id === selectedDataSource.id) dupe = true;
        })

        if (dupe) return

        state.canvasSelectedDataSource = [...state.canvasSelectedDataSource, selectedDataSource]

    }),

    // Selected Column Address Action
    addSelectedColumnAddress: action((state, {newAddress, dataBlockId}) => {
        const addressArray = newAddress.split('@');
        const schema = addressArray[0];
        const category = addressArray[1];
        const table = addressArray[2];
        const column = addressArray[3];

        let tempState = state.selectedAddressObj;

        if (typeof tempState[dataBlockId] === 'undefined') {
            tempState[dataBlockId] = {
                [schema]: {
                    [category]: {
                        [table]: [column]
                    }
                }
            }
        } else if (typeof tempState[dataBlockId][schema] === 'undefined') {
            tempState[dataBlockId][schema] = {
                [category]: {
                    [table]: [column]
                }
            }
        } else if (typeof tempState[dataBlockId][schema][category] === 'undefined') {
            tempState[dataBlockId][schema][category] = {
                [table]: [column]
            }
        } else if (typeof tempState[dataBlockId][schema][category][table] === 'undefined') {
            tempState[dataBlockId][schema][category][table] = [column]
        } else {
            if (!tempState[dataBlockId][schema][category][table].includes(column)) {
                tempState[dataBlockId][schema][category][table].push(column)
                state.selectedAddressObj = tempState
            }
        }
    }),

    removeSelectedColumnAddress: action((state, {addressToRemove, dataBlockId}) => {
        const {schema, category, table, column} = columnAddressSplitter(addressToRemove);
        let tempState = state.selectedAddressObj
        try {
            const newSelectedTableList = tempState[dataBlockId][schema][category][table].filter((el) => el !== column)
            tempState[dataBlockId][schema][category][table] = newSelectedTableList
        } catch (e) {
            console.error(e)
        }
        state.selectedAddressObj = tempState
    }),

    generateStructureIfNotExists: action((state, {columnAddress, dataBlockId}) => {
        const {schema, category, table} = columnAddressSplitter(columnAddress);

        let tempState = state.selectedAddressObj;

        if (typeof tempState[dataBlockId] === 'undefined') {
            tempState[dataBlockId] = {
                [schema]: {
                    [category]: {
                        [table]: []
                    }
                }
            }
        } else if (typeof tempState[dataBlockId][schema] === 'undefined') {
            tempState[dataBlockId][schema] = {
                [category]: {
                    [table]: []
                }
            }
        } else if (typeof tempState[dataBlockId][schema][category] === 'undefined') {
            tempState[dataBlockId][schema][category] = {
                [table]: []
            }
        } else if (typeof tempState[dataBlockId][schema][category][table] === 'undefined') {
            tempState[dataBlockId][schema][category][table] = []
        }

        state.selectedAddressObj = tempState
    }),

    selectAllColumnAddresses: thunk((actions, {bulkAddress, dataBlockId}) => {
        if (!bulkAddress || !bulkAddress.length) return
        bulkAddress.forEach((address) => actions.addSelectedColumnAddress({
            newAddress: address,
            dataBlockId: dataBlockId
        }))
    }),

    deselectAllColumnAddress: thunk((actions, {bulkAddress, dataBlockId}) => {
        if (!bulkAddress || !bulkAddress.length) return
        bulkAddress.forEach((address) => actions.removeSelectedColumnAddress({
            addressToRemove: address,
            dataBlockId: dataBlockId
        }))
    }),

    insertOrRemoveSelectedColumnAddress: thunk(async (actions, {columnAddress, dataBlockId}, {getState}) => {
        actions.generateStructureIfNotExists({columnAddress, dataBlockId});
        const selectedAddressObj = getState().selectedAddressObj;
        const {schema, category, table, column} = columnAddressSplitter(columnAddress);

        if (selectedAddressObj[dataBlockId][schema][category][table].includes(column)) {
            actions.removeSelectedColumnAddress({
                addressToRemove: columnAddress,
                dataBlockId: dataBlockId,
            });
        } else {
            actions.addSelectedColumnAddress({
                newAddress: columnAddress,
                dataBlockId: dataBlockId,
            });
        }
    }),

    // Data Blocks
    addDataBlock: action((state, newDataBlock) => {
        state.dataBlocks = [...state.dataBlocks, newDataBlock]
    }),

    setDataBlocks: action((state, dataBlocks) => {
        state.dataBlocks = dataBlocks;
    }),

    updateDataBlock: thunk((actions, updatedBlock, {getState}) => {
        const {dataBlocks} = getState();
        const blocks = dataBlocks.map((curEl) => {
            if (curEl.dataBlockId === updatedBlock.dataBlockId) {
                const updateDTO = new DataBlockDTO({...updatedBlock})
                return updateDTO
            } else {
                return curEl
            }
        });
        actions.setDataBlocks(blocks);
        actions.convertDataBlocksIntoElement()
    }),

    removeDataBlock: thunk((actions, dataBlockId, {getState}) => {
        const temp = getState().dataBlocks.filter((el) => el.dataBlockId !== dataBlockId);
        actions.setDataBlocks(temp);
    }),

    // Transformation Block
    addTransformationBlock: action((state, newTransformationBlock) => {
        state.transformationBlocks = [...state.transformationBlocks, newTransformationBlock]
    }),

    setTransformationBlocks: action((state, transformationBlocks) => {
        state.transformationBlocks = transformationBlocks;
    }),

    updateTransformationBlock: thunk((actions, updatedBlock, {getState}) => {
        const {transformationBlocks} = getState();
        const blocks = transformationBlocks.map((curEl) => {
            if (curEl.transformationBlockId === updatedBlock.transformationBlockId) {
                const updatedBlockDTO = new TransformationBlockDTO({...updatedBlock});
                return updatedBlockDTO
            } else {
                return curEl
            }
        });
        actions.setTransformationBlocks(blocks);
        actions.convertTransformationBlockIntoElement();
    }),

    removeTransformationBlock: thunk((actions, transformationBlockId, {getState}) => {
        const temp = getState().transformationBlocks.filter((el) => el.transformationBlockId !== transformationBlockId);
        actions.setTransformationBlocks(temp);
    }),

    // Loader
    loadConnections: thunk(async (actions, transformationBlockId, {getState}) => {
        const {elements, transformationBlocks} = getState();

        for (const tfBlock of transformationBlocks) {
            const currentElement = getBlockByEntityId(elements, tfBlock.transformationBlockEntityId);
            const connectedElements = getElementsByEntityIds(elements, tfBlock.inputBlockIds);
            for (const sourceElement of connectedElements) {
                const tempParams = {
                    source: sourceElement.id,
                    sourceHandle: null,
                    target: currentElement.id,
                    targetHandle: null
                }
                actions.connectNodes(tempParams)
            }
        }
    }),
}

const columnAddressSplitter = (columnAddress) => {
    const addressArray = columnAddress.split('@');
    return {
        schema: addressArray[0],
        category: addressArray[1],
        table: addressArray[2],
        column: addressArray[3],
    }
}

const getNodeTypeByDataCatalogId = (catalogId) => {
    switch (catalogId){
        case('postgres'):
        case('bigquery'):
        case('snowflake'):
            return DATA_BLOCK;
        case('transformation'):
            return TRANSFORMATION_BLOCK;
        default:
            return TRANSFORMATION_BLOCK;
    }
}

const getLabelByDataCatalogId = (catalogId) => {
    switch (catalogId){
        case('postgres'):
            return 'Postgres'
        case('bigquery'):
            return 'BigQuery'
        case('snowflake'):
            return 'Snowflake'
        default:
            return 'Invalid Label'
    }
}

export default CanvasModel;