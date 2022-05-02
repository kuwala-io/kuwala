import { action, thunk } from "easy-peasy";
import {removeElements, addEdge} from 'react-flow-renderer'
import {useState} from "react";

const CommonModel =  {
    notificationOpen: false,
    openConfigModal: false,
    reactFlowInstance: null,
    openTransformationCatalogModal: false,

    toggleNotification: action((state) => {
        state.notificationOpen = !state.notificationOpen
    }),

    setReactFlowInstance: action((state, instance)=> {
       state.reactFlowInstance = instance;
    }),

    toggleConfigModal: action((state) => {
        state.openConfigModal = !state.openConfigModal
    }),

    toggleTransformationCatalogModal: action((state) => {
        state.openTransformationCatalogModal = !state.openTransformationCatalogModal
    }),

}

export default CommonModel