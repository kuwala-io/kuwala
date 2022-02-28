import React, {useState, useRef, useEffect} from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    removeElements,
    Controls,
} from 'react-flow-renderer';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NotificationPanel from "../components/NotificationPanel";
import DataView from "../components/DataView";
import {useStoreActions, useStoreState} from 'easy-peasy';

export default function () {
    const [isNotificationOpen, setNotification] = useState(false);
    const toggleNotification = () => setNotification(!isNotificationOpen);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const {elements, selectedElement, newNodeInfo} = useStoreState(state => ({
        elements: state.elements,
        selectedElement: state.selectedElement,
        newNodeInfo: state.newNodeInfo,
    }));
    const {addNode, setSelectedElement, removeNode, connectNodes} = useStoreActions(actions => ({
        addNode: actions.addNode,
        setSelectedElement: actions.setSelectedElement,
        removeNode: actions.removeNode,
        connectNodes: actions.connectNodes,
    }))

    const onConnect = (params) => connectNodes(params)
    const onElementsRemove = (elementsToRemove) => removeNode(elementsToRemove)
    const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (event) => {
        event.preventDefault();
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });
        addNode({
            ...newNodeInfo,
            position
        })
    }

    return (
        <div className={`flex flex-col h-screen overflow-y-hidden antialiased text-gray-900 bg-white`}>
            <div className='flex flex-col h-full w-full'>
                <Header toggleNotification={toggleNotification}/>
                {/* MAIN CONTENT CONTAINER */}
                <div className={'flex flex-row h-full max-h-screen relative'}>
                    <ReactFlowProvider>
                        <Sidebar />
                        <main
                            className='flex h-full w-full flex-col max-h-screen relative'
                            ref={reactFlowWrapper}
                        >
                            <ReactFlow
                                elements={elements}
                                onConnect={onConnect}
                                onElementsRemove={onElementsRemove}
                                onElementClick={(event, elements) => setSelectedElement(elements)}
                                onPaneClick={()=> setSelectedElement(null)}
                                selectNodesOnDrag={false}
                                onLoad={onLoad}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                defaultPosition={[500,150]}
                            >
                                <Controls
                                    style={{right: 10, left: 'auto'}}
                                />
                            </ReactFlow>

                            <DataView/>
                        </main>
                    </ReactFlowProvider>
                </div>

                <NotificationPanel
                    isNotificationOpen={isNotificationOpen}
                    toggleNotification={toggleNotification}
                />
            </div>
        </div>
    )
}