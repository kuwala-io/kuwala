import { action, thunk } from "easy-peasy";
import {removeElements, addEdge} from 'react-flow-renderer'
import {useState} from "react";

const CommonModel =  {
    notificationOpen: false,
    showConfigModal: false,
    reactFlowInstance: null,

    toggleNotification: action((state) => {
        state.notificationOpen = !state.notificationOpen
    }),

    setReactFlowInstance: action((state, instance)=> {
       state.reactFlowInstance = instance;
    }),

    toggleConfigModal: action((state) => {
        state.showConfigModal = !state.showConfigModal
    }),


}

export default CommonModel