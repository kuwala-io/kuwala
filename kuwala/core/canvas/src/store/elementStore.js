import { action, thunk } from "easy-peasy";
import {v4} from "uuid";
import {removeElements, addEdge} from 'react-flow-renderer'

const elementStoreModel =  {
    elements: [],
    selectedElement: null,
    newNodeInfo: {},

    // Actions
    addNode: action((state, nodeInfo) => {
        const newNode = {
            id: v4(),
            type: nodeInfo.type,
            position: nodeInfo.position,
            data: nodeInfo.data,
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
        console.log(selectedNode)
    }),
    setNewNodeInfo: action((state, newNodeInfo) => {
        state.newNodeInfo = newNodeInfo
    })
}

export default elementStoreModel;