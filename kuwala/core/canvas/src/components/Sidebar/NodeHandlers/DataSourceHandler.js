import React, { DragEvent } from 'react';

export default ({onDragStart, onClickAddNode}) => {
    const type = 'dataSource'
    const columns = ['compay_name','lat','log','unique_customer']
    const rows = [
        ['Dabfeed','47.7787755','27.8884238','8390'],
        ['Leenti','40.284979','117.134151','9882'],
        ['Shufflebeat','12.0375095','-61.6676857','1593'],
        ['Voomm','30.948905','108.574058','6556'],
        ['BlogXS','22.863502','114.333767','1099'],
        ['Miboo','31.364902','108.249509','5053'],
        ['Rhynoodle','29.528923','104.990101','2760'],
        ['Cogilith','41.0378199','-7.1696011','2185'],
        ['Tagtune','18.4458276','-96.3598367','3945'],
        ['Feedspan','-6.766979','105.9053689','3131'],
    ]
    const nodeInfo = {
        type,
        data: {
            label: 'Data Source Node',
            columns,
            rows
        },
        sourcePosition: 'right',
    }

    return (
        <div
            className={`
                border-kuwala-green 
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
            Data Source Node
        </div>
    )
}