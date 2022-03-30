import React from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import DataBlocksHandler from "./NodeHandlers/DataBlocksHandler";

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
        </div>
    )
}
