import { action, thunk } from "easy-peasy";
import {v4} from "uuid";
import {removeElements, addEdge} from 'react-flow-renderer'

import {getAllDataCatalogItems, saveSelectedDataCatalogItems} from '../../../api/DataCatalogApi';
import {getDataSource} from '../../../api/DataSourceApi';

import DataSourceDTO from '../../dto/DataSourceDTO';
import DataBlockDTO from "../../dto/DataBlockDTO";
import {data} from "autoprefixer";

const CanvasModel =  {
    elements: [],
    selectedElement: null,
    newNodeInfo: {},
    openDataView: false,
    dataSource: [],
    availableDataSource: [],
    selectedDataSource: [],
    canvasSelectedDataSource: [],
    selectedColumnAddress: [],
    selectedAddressObj: {},
    dataBlocks: [],

    // Elements
    addNode: action((state, nodeInfo) => {
        const newNode = {
            id: v4(),
            ...nodeInfo
        };
        state.elements.push(newNode)
    }),

    updateNodePayloadByDataBlock: action( (state, {updatedNodeInfo, dataBlockId}) => {
        const tempElement = state.elements;
        const updatedElements = tempElement.map((el)=> {
            if(el.data.dataBlock.dataBlockId === dataBlockId) {
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
                if(curEl.data.dataBlock.dataBlockId === block.dataBlockId) dupeFlag = true;
            });

            const nodeInfo = {
                type: getNodeTypeByDataCatalogId(block.dataCatalogType),
                data: {
                    label: getLabelByDataCatalogId(block.dataCatalogType),
                    dataSource: block.dataSourceDTO,
                    dataBlock: {...block},
                },
                sourcePosition: 'right',
                targetPosition: 'left',
            }

            if(dupeFlag) {
                // If node same node exists -> Update the node info
                actions.updateNodePayloadByDataBlock({updatedNodeInfo: nodeInfo, dataBlockId: block.dataBlockId})
            }else {
                // Else add new node
                actions.addNode({
                    ...nodeInfo,
                    position: {
                        x: -100,
                        y: Math.random() * window.innerHeight/2,
                    },
                })
            }
        });
    }),
    removeNode: thunk((actions, nodeToRemove, {getState}) => {
        actions.setElements(removeElements(getState().elements, nodeToRemove))
        actions.setSelectedElement(null)
    }),
    connectNodes: thunk((actions, params, {getState}) => {
        actions.setElements(addEdge(params, getState().elements))
    }),
    setElements: action((state, elements) => {
       state.elements = elements
    }),
    setSelectedElement: action((state, selectedNode) => {
        state.selectedElement = selectedNode
    }),
    setSelectedElementByDataBlockId: action((state, selectedDataBlockId) => {
        const selectedElement = state.elements.filter((el) => el.data.dataBlock.dataBlockId === selectedDataBlockId);
        if(!selectedElement.length) return
        state.selectedElement = selectedElement[0]
    }),
    setNewNodeInfo: action((state, newNodeInfo) => {
        state.newNodeInfo = newNodeInfo
    }),

    setOpenDataView: action((state, openDataView) => {
        state.openDataView = openDataView
    }),
    toggleDataView: action((state, dataView) => {
       state.openDataView =  !state.openDataView
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

        result.data.forEach((e,i)=> {
            const data_catalog_item_id = e.data_catalog_item_id;
            const index = dataCatalog.findIndex((e, i) => {
                if(e.id === data_catalog_item_id) return true
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
        if (response.status === 200){
            const data = response.data
            actions.setAvailableDataSource(data)
        }else {
            actions.setAvailableDataSource([])
        }
    }),


    // Selected Data Sources
    setSelectedSources: action((state, newSelectedSources) => {
        state.selectedDataSource = newSelectedSources
    }),
    saveSelectedSources: thunk(async (actions, params, {getState}) => {
        const selectedSource = getState().selectedDataSource;

        if(!selectedSource.length) {
            console.error("Selected source is empty")
            return;
        }
        const idList = selectedSource.map((el)=> el.id);
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

        if(dupe) return

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

        if(typeof tempState[dataBlockId] === 'undefined') {
            tempState[dataBlockId] = {
                    [schema]: {
                        [category]: {
                            [table]: [column]
                        }
                }
            }
        } else if(typeof tempState[dataBlockId][schema] === 'undefined') {
            tempState[dataBlockId][schema] = {
                [category]: {
                    [table]: [column]
                }
            }
        } else if (typeof tempState[dataBlockId][schema][category] === 'undefined'){
            tempState[dataBlockId][schema][category] = {
                    [table]: [column]
            }
        } else if (typeof tempState[dataBlockId][schema][category][table] === 'undefined') {
            tempState[dataBlockId][schema][category][table] = [column]
        } else {
            if (!tempState[dataBlockId][schema][category][table].includes(column)){
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

        if(typeof tempState[dataBlockId] === 'undefined') {
            tempState[dataBlockId] = {
                [schema]: {
                    [category]: {
                        [table]: []
                    }
                }
            }
        } else if(typeof tempState[dataBlockId][schema] === 'undefined') {
            tempState[dataBlockId][schema] = {
                [category]: {
                    [table]: []
                }
            }
        } else if (typeof tempState[dataBlockId][schema][category] === 'undefined'){
            tempState[dataBlockId][schema][category] = {
                [table]: []
            }
        } else if (typeof tempState[dataBlockId][schema][category][table] === 'undefined') {
            tempState[dataBlockId][schema][category][table] = []
        }

        state.selectedAddressObj = tempState
    }),

    selectAllColumnAddresses: thunk((actions, {bulkAddress, dataBlockId}) => {
        if(!bulkAddress || !bulkAddress.length) return
        bulkAddress.forEach((address) => actions.addSelectedColumnAddress({
            newAddress: address,
            dataBlockId: dataBlockId
        }))
    }),

    deselectAllColumnAddress: thunk((actions, {bulkAddress, dataBlockId}) => {
        if(!bulkAddress || !bulkAddress.length) return
        bulkAddress.forEach((address) => actions.removeSelectedColumnAddress({
            addressToRemove: address,
            dataBlockId: dataBlockId
        }))
    }),

    insertOrRemoveSelectedColumnAddress: thunk(async (actions, {columnAddress, dataBlockId}, {getState}) => {
        actions.generateStructureIfNotExists({columnAddress, dataBlockId});
        const selectedAddressObj = getState().selectedAddressObj;
        const {schema, category, table, column} = columnAddressSplitter(columnAddress);

        if(selectedAddressObj[dataBlockId][schema][category][table].includes(column)){
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
    addDataBlock: action((state, newDataBlock)=>{
        state.dataBlocks = [...state.dataBlocks, newDataBlock]
    }),

    setDataBlocks: action((state, dataBlocks) => {
        state.dataBlocks = dataBlocks;
    }),

    updateDataBlock: thunk((actions, updatedBlock,{getState})=> {
        const {dataBlocks} = getState();
        const blocks = dataBlocks.map((curEl) => {
            if(curEl.dataBlockId === updatedBlock.dataBlockId){
                return updatedBlock
            }else {
                return curEl
            }
        });
        actions.setDataBlocks(blocks);
        actions.convertDataBlocksIntoElement()
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
            return 'dataBlock'
        default:
            return 'transformation'
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