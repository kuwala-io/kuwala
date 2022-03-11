import { action, thunk } from "easy-peasy";
import {v4} from "uuid";
import {removeElements, addEdge} from 'react-flow-renderer'

import {getAllDataCatalogItems, saveSelectedDataCatalogItems} from '../../api/DataCatalogApi';
import {getDataSource, saveConnection} from '../../api/DataSourceApi';

const CanvasModel =  {
    elements: [],
    selectedElement: null,
    newNodeInfo: {},
    openDataView: false,
    dataSource: [],
    availableDataSource: [],
    selectedDataSource: [],

    // Elements
    addNode: action((state, nodeInfo) => {
        const newNode = {
            id: v4(),
            ...nodeInfo
        };
        state.elements.push(newNode)
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
    setNewNodeInfo: action((state, newNodeInfo) => {
        state.newNodeInfo = newNodeInfo
    }),
    setOpenDataView: action((state, openDataView) => {
        state.openDataView = openDataView
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
        const populatedDataSource = result.data.map((e,i)=> {
            const data_catalog_item_id = e.data_catalog_item_id;
            const index = dataCatalog.findIndex((e, i) => {
                if(e.id === data_catalog_item_id) return true
            });
            return {
                ...e,
                logo: dataCatalog[index].logo,
                name: dataCatalog[index].name,
            }
        });
        actions.setDataSource(populatedDataSource)
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

        if(selectedSource.length <= 0) {
            console.log("Selected source is empty")
            return;
        }
        const idList = selectedSource.map((el)=> el.id);
        const response = await saveSelectedDataCatalogItems({
            item_ids: idList
        });
        actions.getDataSources()
    }),
}

export default CanvasModel;