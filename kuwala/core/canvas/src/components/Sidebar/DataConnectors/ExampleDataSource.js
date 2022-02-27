import React, { DragEvent } from 'react';

export default ({onDragStart, onClickAddNode}) => {
    const type = 'input'
    const data = {
        label: <h1>INPUT NODE</h1>
    }
    const nodeName = 'Input Node'

    const nodeInfo = {
        type,
        rows: ['a'],
        data
    }


    return (
        <div
            className={`
                    border-blue-500 
                    text-xs
                    p-4
                    m-0
                    border-2
                    rounded-lg
            `}
            onDragStart={(event: DragEvent) => onDragStart(event, nodeInfo)}
            onClick={() => onClickAddNode(nodeInfo)}
            draggable
        >
            { nodeName }
        </div>
    )
}