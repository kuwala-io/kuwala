import React from 'react';
import {getBezierPath} from "react-flow-renderer";

export default ({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        connectionLineType,
        connectionLineStyle,
    }) => {

    const edgePath = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <g>
            <path
                fill="none"
                stroke="#222"
                strokeWidth={6}
                className="animated"
                d={edgePath}
            />
            <circle cx={targetX} cy={targetY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
        </g>
    );
};