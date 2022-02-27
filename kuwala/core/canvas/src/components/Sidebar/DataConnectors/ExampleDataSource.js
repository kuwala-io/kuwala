import React, { DragEvent } from 'react';

export default ({onDragStart, onClickAddNode}) => {
    const type = 'input'
    const rows = ['First Name','Second First Name','Last Name']
    const dataRows = [
        ['Elijah','Elijah','Talloe'],
        ['Theo','Theo','Ditts'],
        ['Lauretta','Lauretta','Duncanson'],
        ['Alikee','Alikee','Bartke'],
        ['Ethelind','Ethelind','Soule'],
        ['Lucian','Lucian','Rastall'],
        ['Fabian','Fabian','Cumming'],
        ['Bartie','Bartie','Deverill'],
        ['Jedidiah','Jedidiah','Oldford'],
        ['Tod','Tod','Mugg'],
    ]
    const data = {
        label: 'Input Node',
        rows,
        dataRows
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