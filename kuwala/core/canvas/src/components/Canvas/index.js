import ReactFlow, {Controls, ReactFlowProvider} from "react-flow-renderer";
import ConnectionLine from "../Common/ConnectionLine";
import TransformationBlock from "../Nodes/TransformationBlock/TransformationBlock";
import DataBlock from "../Nodes/DataBlock";
import ConnectionEdge from "../Common/ConnectionEdge";
import DataView from "../DataView";
import React from "react";

const Canvas = ({
    elements,
    onConnect,
    onDragOver,
    onElementsRemove,
    onLoad,
    openDataView,
    reactFlowWrapper,
    setOpenDataView,
    setSelectedElement
}) => {
    return (
        <ReactFlowProvider>
            <main
                className='flex h-full w-full flex-col max-h-screen relative'
                ref={reactFlowWrapper}
            >
                <ReactFlow
                    elements={elements}
                    connectionLineComponent={ConnectionLine}
                    onConnect={onConnect}
                    onElementsRemove={onElementsRemove}
                    onElementClick={(event, elements) => {
                        setOpenDataView(false)
                        setSelectedElement(elements)
                    }}
                    onPaneClick={()=> {
                        setSelectedElement(null)
                        setOpenDataView(false)
                    }}
                    nodeTypes={{
                        TRANSFORMATION_BLOCK: TransformationBlock,
                        DATA_BLOCK: DataBlock,
                    }}
                    edgeTypes={{
                        CONNECTION_EDGE: ConnectionEdge
                    }}
                    selectNodesOnDrag={false}
                    onLoad={onLoad}
                    onDragOver={onDragOver}
                    defaultPosition={[500,150]}
                >
                    <Controls
                        style={{
                            right: 20,
                            left: 'auto',
                            zIndex: 20,
                            bottom: openDataView ?'calc(45% + 10px)' : 20,
                        }}
                    />
                </ReactFlow>

                {openDataView && <DataView />}
            </main>
        </ReactFlowProvider>
    )
}

export default Canvas;
