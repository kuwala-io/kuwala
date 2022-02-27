import React, { DragEvent } from 'react';

export default ({onDragStart, onClickAddNode}) => {
    const type = 'default'
    const data = {
        label: 'Processor Node'
    }



    return (
        <div
            className={`
                    border-stone-500
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
            Processor Node
        </div>
    )
}