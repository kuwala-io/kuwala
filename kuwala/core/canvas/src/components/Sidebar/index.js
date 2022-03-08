import React, {useState} from "react";

import DataSourceHandler from "./NodeHandlers/DataSourceHandler";
import TransformationHandler from "./NodeHandlers/TransformationHandler";
import VisualizationHandler from "./NodeHandlers/VisualizationHandler";
import {useStoreActions, useStoreState} from "easy-peasy";
import {Link} from "react-router-dom";

import AddSourcesGreen from "../../icons/add_sources_green.png";

export default () => {
    const {addNode, setNewNodeInfo} = useStoreActions(actions => actions.canvas)
    const {dataSource} = useStoreState(state => state.canvas)

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

    const renderDataSources = () => {
        if(dataSource.length > 0) {
            return (
                <>
                    <DataSourceHandler onDragStart={onDragStart} onClickAddNode={onClickAddNode}/>
                    <TransformationHandler onDragStart={onDragStart} onClickAddNode={onClickAddNode}/>
                    <VisualizationHandler onDragStart={onDragStart} onClickAddNode={onClickAddNode}/>
                </>
            )
        }else {
            return (
                <Link
                    to={"/data-catalog"}
                    className={`mt-12`}
                >
                    <div className={`flex flex-col justify-items-center items-center align-items-center`}>
                        <img
                            src={AddSourcesGreen}
                            style={{height: 80, width: 80}}
                            alt={'data-source'}
                        />
                        <label className={'mt-4 cursor-pointer'}>Add data source</label>
                    </div>
                </Link>
            )
        }
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
                    <div className={`flex items-center justify-center flex-shrink-0 p-2 ${dataSource.length > 0 ? '' : 'hidden'}`}>
                        <span className={`p-2 text-xl font-semibold tracking-wider whitespace-nowrap`}>
                            <span>Data Sources</span>
                        </span>
                    </div>

                    {/* CONNECTOR CONTAINERS */}
                    <div className={'flex flex-col p-2 pr-8 pl-8 space-y-4 justify-items-center'}>
                        {renderDataSources()}
                    </div>
                </aside>
            </div>

            <div className={`
                relative
                ${dataSource.length > 0 ? '' : 'hidden'}
            `}>
                <button
                    to={'/data-catalog'}
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
                            text-center
                        `}
                >
                    +
                </button>
            </div>
        </div>
    )
}