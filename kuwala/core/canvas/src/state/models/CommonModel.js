import { action, thunk } from "easy-peasy";
import {removeElements, addEdge} from 'react-flow-renderer'
import {useState} from "react";

const CommonModel =  {
    notificationOpen: false,
    toggleNotification: action((state) => {
        state.notificationOpen = !state.notificationOpen
    }),
}

export default CommonModel