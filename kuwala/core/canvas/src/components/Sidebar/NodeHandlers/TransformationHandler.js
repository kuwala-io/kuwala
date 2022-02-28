import React, { DragEvent } from 'react';

export default ({onDragStart, onClickAddNode}) => {
    const type = 'transformation'
    const columns = ['compay_name','lat','log','unique_customer','returning_customer','domain']
    const rows = [
        ['Quire','-18.6248754','-43.058341','8463','2994','nsw.gov.au'],
        ['Topiczoom','-38.956431','-68.23127','6771','2687','multiply.com'],
        ['Zoombox','43.5161759','68.5090258','6058','1457','technorati.com'],
        ['Meevee','-12.7398884','-60.1422676','5070','1918','upenn.edu'],
        ['Twitterwire','30.475663','-87.193563','4738','2951','nps.gov'],
        ['Topiclounge','10.3764175','119.1852645','6369','1274','globo.com'],
        ['Devcast','47.236015','127.114832','3700','1890','ovh.net'],
        ['Devpulse','52.20307','17.48955','8757','1321','live.com'],
        ['Plajo','59.5448264','13.5422638','5122','1528','chicagotribune.com'],
        ['Zoomdog','34.440727','134.9171616','7576','2907','webnode.com'],
    ]
    const nodeInfo = {
        type,
        data: {
            label: 'Transfrmation Node',
            columns,
            rows
        },
        sourcePosition: 'right',
        targetPosition: 'left',
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
            onDragStart={(event: DragEvent) => onDragStart(event, nodeInfo)}
            onClick={() => onClickAddNode(nodeInfo)}
            draggable
        >
            Transformation Node
        </div>
    )
}