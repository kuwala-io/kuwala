import React from 'react';
import DataBlockDTO from "../../../data/dto/DataBlockDTO";
import {v4} from "uuid";
import {useStoreActions, useStoreState} from "easy-peasy";
import {DATA_BLOCK} from "../../../constants/nodeTypes";
import {getLabelByDataCatalogId} from "../../../utils/DataBlockUtils";

const DataBlocksHandler = ({onDragStart, onClickAddDataBlock, dataSource, reactFlowWrapper}) => {
    const { addNode, setElements } = useStoreActions(({ canvas }) => canvas);
    const { addDataBlock, convertDataBlocksIntoElements } = useStoreActions(({ dataBlocks }) => dataBlocks);
    const { reactFlowInstance } = useStoreState(({ common }) => common);
    const { elements } = useStoreState(({ canvas }) => canvas);

    const dataBlock = new DataBlockDTO({
        tableName: null,
        schemaName: null,
        dataSetName: null,
        dataBlockId: v4(),
        dataBlockEntityId: null,
        isConfigured: false,
        dataSourceDTO: dataSource,
        dataSourceId: dataSource.id,
        columns: [],
        name: `${dataSource.dataCatalogItemId}`,
        dataCatalogType: dataSource.dataCatalogItemId,
        selectedAddressString: null,
    });

    const nodeInfo = {
        type: DATA_BLOCK,
        data: {
            label: getLabelByDataCatalogId(dataBlock.dataCatalogType),
            dataSource: dataBlock.dataSourceDTO,
            dataBlock: dataBlock,
        },
        sourcePosition: 'right',
        targetPosition: 'left',
    }

    return (
        <div
            className={`
                    p-5
                    m-0
                    shadow-xl
                    rounded-lg
                    w-24
                    h-24
                    flex flex-col justify-center items-center
                    relative
            `}
            onDragStart={(event) => onDragStart(event, nodeInfo)}
            onClick={() => {
                onClickAddDataBlock(dataBlock);
                convertDataBlocksIntoElements({ addNode, elements, setElements });
            }}
            onDragEnd={(event)=> {
                event.preventDefault();
                const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
                const position_x = event.clientX - reactFlowBounds.left;
                const position_y = event.clientY - reactFlowBounds.top;
                const position = reactFlowInstance.project({
                    x: position_x,
                    y: position_y,
                });
                dataBlock.position_y = position_y;
                dataBlock.position_x = position_x;

                addDataBlock(dataBlock);
                addNode({
                    ...nodeInfo,
                    position: position
                });
            }}
            draggable
        >
            <img
                draggable={false}
                src={dataSource.logo}
                alt={`${dataSource.name} logo`}
            />
            <span className={'mt-1 font-semibold text-xs'}>{dataSource.name}</span>
            <div
                className={`
                    absolute right-0 top-0 p-1 border rounded-full w-5 h-5 -mr-2 -mt-2
                    ${dataSource.connected ? "bg-kuwala-green" : "bg-red-400"}
                `}
            />
        </div>
    )
}

export default DataBlocksHandler;
