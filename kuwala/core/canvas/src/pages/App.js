import React, { useState, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    removeElements,
    Controls,
} from 'react-flow-renderer';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NotificationPanel from "../components/NotificationPanel";

const initialElements = [
    {
        id: '1',
        type: 'input', // input node
        data: { label: 'Input Node' },
        position: { x: 250, y: 25 },
    },
    // default node
    {
        id: '2',
        // you can also pass a React component as a label
        data: { label: <div>Default Node</div> },
        position: { x: 100, y: 125 },
    },
    {
        id: '3',
        type: 'output', // output node
        data: { label: 'Output Node' },
        position: { x: 250, y: 250 },
    },
    // animated edge
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3' },
];

export default function () {
    const [sidebar, setSidebar] = useState(true);
    const toggleSidebar = () => {
        setSidebar(!sidebar)
    }
    const [isNotificationOpen, setNotification] = useState(false);
    const toggleNotification = () => {
        setNotification(!isNotificationOpen);
    }

    let id = 0;
    const getId = () => `dndnode_${id++}`;

    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [elements, setElements] = useState(initialElements);
    const onConnect = (params) => setElements((els) => addEdge(params, els));
    const onElementsRemove = (elementsToRemove) =>
        setElements((els) => removeElements(elementsToRemove, els));

    const onLoad = (_reactFlowInstance) =>
        setReactFlowInstance(_reactFlowInstance);

    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (event) => {
        event.preventDefault();

        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });
        const newNode = {
            id: Math.random(),
            type,
            position,
            data: { label: `${type} node` },
        };

        setElements((es) => es.concat(newNode));
    }

    return (
        <div className={`flex flex-col h-screen overflow-y-hidden antialiased text-gray-900 bg-white`}>
            <div className='flex flex-col h-full overflow-hidden w-full'>
                <Header toggleNotification={toggleNotification}/>

                {/* MAIN CONTENT CONTAINER */}
                <div className={'flex flex-row h-full max-h-screen relative'}>
                    <ReactFlowProvider>
                        <Sidebar
                            sidebar={sidebar}
                            toggleSidebar={toggleSidebar}
                        />
                        <main
                            className='flex-1 h-full max-h-full w-full overflow-hidden overflow-y-scroll'
                            ref={reactFlowWrapper}
                        >
                            <ReactFlow
                                elements={elements}
                                onConnect={onConnect}
                                onElementsRemove={onElementsRemove}
                                onLoad={onLoad}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                            />
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
