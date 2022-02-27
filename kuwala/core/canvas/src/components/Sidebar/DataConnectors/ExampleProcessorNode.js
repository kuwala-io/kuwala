import React, { DragEvent } from 'react';

export default ({onDragStart, onClickAddNode}) => {
    const type = 'default'
    const rows = ['First Name','Second First Name','Last Name','First Name','Second First Name','Last Name']
    const dataRows = [
        ['Elijah','Elijah','Talloe','Elijah','Elijah','Talloe'],
        ['Theo','Theo','Ditts','Theo','Theo','Ditts'],
        ['Lauretta','Lauretta','Duncanson','Lauretta','Lauretta','Duncanson'],
        ['Alikee','Alikee','Bartke','Alikee','Alikee','Bartke'],
        ['Ethelind','Ethelind','Soule','Ethelind','Ethelind','Soule'],
        ['Lucian','Lucian','Rastall','Lucian','Lucian','Rastall'],
        ['Fabian','Fabian','Cumming','Fabian','Fabian','Cumming'],
        ['Bartie','Bartie','Deverill','Bartie','Bartie','Deverill'],
        ['Jedidiah','Jedidiah','Oldford','Jedidiah','Jedidiah','Oldford'],
        ['Tod','Tod','Mugg','Tod','Tod','Mugg'],
    ]
    const data = {
        label: 'Processor Node',
        rows,
        dataRows
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