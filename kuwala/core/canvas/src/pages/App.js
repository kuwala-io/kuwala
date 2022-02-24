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

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export default function () {
    const [sidebar, setSidebar] = useState(false);
    const toggleSidebar = () => {
        setSidebar(!sidebar)
    }
    const [isNotificationOpen, setNotification] = useState(false);
    const toggleNotification = () => {
        setNotification(!isNotificationOpen);
    }

    const [selectedElement, setSelectedElement] = useState(null);

    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [elements, setElements] = useState([]);
    const onConnect = (params) => setElements((els) => addEdge(params, els));
    const onElementsRemove = (elementsToRemove) => {
        setSelectedElement(null)
        setElements((els) => removeElements(elementsToRemove, els));
    }

    const onLoad = (_reactFlowInstance) =>
        setReactFlowInstance(_reactFlowInstance);

    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (event) => {
        event.preventDefault();

        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const {type, data} = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        console.log(type, data)
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });

        const newNode = {
            id: getRandomInt(1000).toString(),
            type,
            position,
            data: { label: `${data}` },
        };

        setElements(prevState => {
            return [...prevState, newNode]
        });
    }

    const onClickAddNode = ({type, data}) => {
        const newNode = {
            id: getRandomInt(1000).toString(),
            type: type,
            data: { label: data },
            position: {
                x: -100,
                y: Math.random() * window.innerHeight/2,
            },
        };
        setElements((els) => els.concat(newNode));
    }

    useEffect(()=>{

    }, [selectedElement])

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
                            onClickAddNode={onClickAddNode}

                        />
                        <main
                            className='flexh-full w-full'
                            ref={reactFlowWrapper}
                        >
                            <ReactFlow
                                elements={elements}
                                onConnect={onConnect}
                                onElementsRemove={onElementsRemove}
                                onElementClick={(event, elements) => {
                                    setSelectedElement(elements)
                                }}
                                onPaneClick={()=>{
                                    setSelectedElement(null)
                                }}
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
                        </main>
                    </ReactFlowProvider>
                </div>

                <DataView
                    isDataTableHidden={selectedElement == null}
                />

                <NotificationPanel
                    isNotificationOpen={isNotificationOpen}
                    toggleNotification={toggleNotification}
                />
            </div>
        </div>
    )
}
