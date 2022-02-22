import React, { DragEvent } from 'react';

export default ({onDragStart}) => {
    const NODE_NAME = 'input'
    return (
        <div
            className={`
                    border-kuwala-green 
                    text-sm
                    p-2
                    m-0
                    border-2
                    rounded-lg
            `}
            onDragStart={(event: DragEvent) => onDragStart(event, NODE_NAME)}
            draggable
        >
            Input Node
        </div>
    )
}