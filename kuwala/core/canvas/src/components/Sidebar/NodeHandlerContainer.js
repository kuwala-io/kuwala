import React from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import DataBlocksHandler from "./NodeHandlers/DataBlocksHandler";
import AddSourcesGreen from "../../icons/add_sources_green.png";
import {Link} from "react-router-dom";
import {v4} from "uuid";

export default ({reactFlowWrapper}) => {
    const { dataSource } = useStoreState(state => state.canvas);
    const { setNewNodeInfo } = useStoreActions(actions => actions.canvas);
    const { addDataBlock } = useStoreActions((actions) => actions.canvas);

    const onDragStart = (event, newNodeInfo) => {
        setNewNodeInfo(newNodeInfo)
        event.dataTransfer.effectAllowed = 'move';
    };

    const onClickAddDataBlock = (dataBlocks) => {
        addDataBlock(dataBlocks)
    }

    const getHandlerTemplate = (dataSource) => {
        switch (dataSource.dataCatalogItemId) {
            case 'postgres':
            case 'bigquery':
            case 'snowflake':
                return <
                    DataBlocksHandler
                        onDragStart={onDragStart}
                        onClickAddDataBlock={onClickAddDataBlock}
                        dataSource={dataSource}
                        reactFlowWrapper={reactFlowWrapper}
                        key={v4()}
                />
            default:
                return null
        }
    }

    return (
        <div className={'flex flex-col justify-center items-center select-none space-y-6'}>
            {
                dataSource.filter((el) => el.connected).map((dataSource) => {
                    const handlerToRender = getHandlerTemplate(dataSource);
                    return handlerToRender
                })
            }
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
        </div>
    )
}
