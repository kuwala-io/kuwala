import React, { DragEvent } from 'react';

export default ({onDragStart, onClickAddNode}) => {
    const type = 'output'
    const data = 'Output Node'
    return (
        <div
            className={`
                    border-red-500
                    text-xs
                    p-4
                    m-0
                    border-2
                    rounded-lg
            `}
            onDragStart={(event: DragEvent) => onDragStart(event, {type, data})}
            onClick={() => onClickAddNode({type, data})}
            draggable
        >
            Output Node
        </div>
    )
}