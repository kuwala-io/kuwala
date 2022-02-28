import React, {useState} from "react";

import DataSourceHandler from "./NodeHandlers/DataSourceHandler";
import TransformationHandler from "./NodeHandlers/TransformationHandler";
import VisualizationHandler from "./NodeHandlers/VisualizationHandler";
import {useStoreActions, useStoreState} from "easy-peasy";

export default () => {
    const {addNode, setNewNodeInfo} = useStoreActions(actions => ({
        addNode: actions.addNode,
        setNewNodeInfo: actions.setNewNodeInfo
    }))

    const onDragStart = (event, newNodeInfo) => {
        setNewNodeInfo(newNodeInfo)
        event.dataTransfer.effectAllowed = 'move';
    };

    const onClickAddNode = (newNodeInfo) => {
        addNode({
            ...newNodeInfo,
            position: {
                x: -100,
                y: Math.random() * window.innerHeight/2,
            },
        })
    }

    return (
        <div className={`
            flex
            flex-row
            transition-all
            transform
            h-full
            w-64
            lg:w-80
            z-10
            `}
        >
            <div className={'w-full'}>
                <aside
                    className={`
                        inset-y-0
                        flex flex-col flex-shrink-0
                        w-full
                        overflow-hidden
                        bg-white
                        border-r
                        h-full
                        shadow-sm
                        top-0`
                    }
                >
                    {/* Header and Toggle */}
                    <div className={`flex items-center justify-center flex-shrink-0 p-2`}>
                        <span className={`p-2 text-xl font-semibold tracking-wider whitespace-nowrap`}>
                            <span>DATA SOURCES</span>
                        </span>
                    </div>

                    {/* CONNECTOR CONTAINERS */}
                    <div className={'flex flex-col p-2 pr-8 pl-8 space-y-4'}>
                        <DataSourceHandler onDragStart={onDragStart} onClickAddNode={onClickAddNode}/>
                        <TransformationHandler onDragStart={onDragStart} onClickAddNode={onClickAddNode}/>
                        <VisualizationHandler onDragStart={onDragStart} onClickAddNode={onClickAddNode}/>
                    </div>
                </aside>
            </div>

            <div className={'relative'}>
                <button
                    onClick={()=>alert('Will show modal')}
                    className={`
                            ml-4
                            mt-4
                            w-12
                            h-12
                            rounded-lg 
                            absolute
                            text-xl
                            font-bold
                            border-2
                            border-kuwala-red
                            bg-white
                            text-kuwala-red
                        `}
                >
                    +
                </button>
            </div>
        </div>
    )
}