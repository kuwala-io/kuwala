import { action, thunk } from "easy-peasy";
import {removeElements, addEdge} from 'react-flow-renderer'
import {useState} from "react";

const CommonModel =  {
    notificationOpen: false,
    openConfigModal: false,
    openTransformationConfigModal: false,
    reactFlowInstance: null,
    openBlockCatalogModal: false,
    connectionLoaded: false,
    existingBlockLoaded: false,

    toggleNotification: action((state) => {
        state.notificationOpen = !state.notificationOpen
    }),

    toggleBlockCatalogModal: action((state) => {
        state.openBlockCatalogModal = !state.openBlockCatalogModal;
    }),

    setReactFlowInstance: action((state, instance)=> {
       state.reactFlowInstance = instance;
    }),

    setConnectionLoaded: action((state, loaded) => {
        state.connectionLoaded = loaded;
    }),

    setExistingBlockLoaded: action((state, loaded) => {
        state.existingBlockLoaded = loaded;
    }),

    toggleConfigModal: action((state) => {
        state.openConfigModal = !state.openConfigModal
    }),

    toggleTransformationCatalogModal: action((state) => {
        state.openTransformationCatalogModal = !state.openTransformationCatalogModal
    }),

    toggleTransformationConfigModal: action((state) => {
        state.openTransformationConfigModal = !state.openTransformationConfigModal
    }),

}

export default CommonModel