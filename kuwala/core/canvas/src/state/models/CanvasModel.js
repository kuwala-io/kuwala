import { action, thunk } from "easy-peasy";
import {v4} from "uuid";
import {removeElements, addEdge} from 'react-flow-renderer'

import {getAllDataCatalog} from '../../api/DataCatalogApi'

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
        state.dataSource.push(dataSource)
    }),

    // Available Data Sources
    setAvailableDataSource: action((state, newAvailableSource) => {
        state.availableDataSource = newAvailableSource
    }),

    getAvailableDataSource: thunk(async (actions) => {
        const newAvailableDataSources = await getAllDataCatalog();
        actions.setAvailableDataSource(newAvailableDataSources)
    }),

    // Selected Data Sources
    setSelectedSources: action((state, newSelectedSources) => {
        state.selectedDataSource = newSelectedSources
    }),
}

export default CanvasModel;