import { action, thunk } from "easy-peasy";
import {removeElements, addEdge} from 'react-flow-renderer'
import {useState} from "react";

const CommonModel =  {
    notificationOpen: false,
    openConfigModal: false,
    openTransformationConfigModal: false,
    reactFlowInstance: null,
    openTransformationCatalogModal: false,
    isConnectionLoaded: false,
    isExistingBlockLoaded: false,

    toggleNotification: action((state) => {
        state.notificationOpen = !state.notificationOpen
    }),

    toggleTransformationConfigModal: action((state) => {
        state.openTransformationConfigModal = !state.openTransformationConfigModal;
    }),

    setReactFlowInstance: action((state, instance)=> {
       state.reactFlowInstance = instance;
    }),

    setConnectionLoaded: action((state, loaded) => {
        state.isConnectionLoaded = loaded;
    }),

    setExistingBlockLoaded: action((state, loaded) => {
        state.isExistingBlockLoaded = loaded;
    }),

    toggleConfigModal: action((state) => {
        state.openConfigModal = !state.openConfigModal
    }),

    toggleTransformationCatalogModal: action((state) => {
        state.openTransformationCatalogModal = !state.openTransformationCatalogModal
    }),

}

export default CommonModel