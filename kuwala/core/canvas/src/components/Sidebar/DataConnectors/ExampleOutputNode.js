import React, { DragEvent } from 'react';

export default ({onDragStart, onClickAddNode}) => {
    const type = 'output'
    const rows = ['First Name','Last Name']
    const dataRows = [
        ['Elijah','Talloe'],
        ['Theo','Ditts'],
        ['Lauretta','Duncanson'],
        ['Alikee','Bartke'],
        ['Ethelind','Soule'],
        ['Lucian','Rastall'],
        ['Fabian','Cumming'],
        ['Bartie','Deverill'],
        ['Jedidiah','Oldford'],
        ['Tod','Mugg'],
    ]
    const data = {
        label: 'Output Node',
        rows,
        dataRows
    }
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