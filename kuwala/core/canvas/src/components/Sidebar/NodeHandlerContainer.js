import React from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import DataBlocksHandler from "./NodeHandlers/DataBlocksHandler";
import AddSourcesGreen from "../../icons/add_sources_green.png";
import {Link} from "react-router-dom";

const NodeHandlerContainer = ({reactFlowWrapper}) => {
    const { dataSources } = useStoreState(({ dataSources }) => dataSources);
    const { setNewNodeInfo } = useStoreActions(({ canvas }) => canvas);
    const { addDataBlock } = useStoreActions(({ dataBlocks }) => dataBlocks);

    const onDragStart = (event, newNodeInfo) => {
        setNewNodeInfo(newNodeInfo)
        event.dataTransfer.effectAllowed = 'move';
    };

    const onClickAddDataBlock = (dataBlock) => {
        addDataBlock(dataBlock);
    }

    const getHandlerTemplate = (dataSource) => {
        switch (dataSource.dataCatalogItemId) {
            case 'postgres':
            case 'bigquery':
            case 'snowflake':
                return (
                    <DataBlocksHandler
                        onDragStart={onDragStart}
                        onClickAddDataBlock={onClickAddDataBlock}
                        dataSource={dataSource}
                        reactFlowWrapper={reactFlowWrapper}
                        key={dataSource.dataCatalogItemId}
                    />
                );
            default:
                return null
        }
    }

    return (
        <div className={'flex flex-col justify-center items-center select-none space-y-6'}>
            {
                dataSources.filter((el) => el.connected).map((dataSource) => {
                    return getHandlerTemplate(dataSource);
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

export default NodeHandlerContainer;
