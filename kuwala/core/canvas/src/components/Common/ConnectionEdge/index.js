import React from 'react';
import { getBezierPath } from 'react-flow-renderer';
import {KUWALA_GREEN} from "../../../constants/styling";

export default function CustomEdge({
           id,
           sourceX,
           sourceY,
           targetX,
           targetY,
           sourcePosition,
           targetPosition,
           markerEnd,
       }) {
    const edgePath = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <path
                id={id}
                style={{
                    strokeWidth: 5,
                    stroke: KUWALA_GREEN
                }}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
        </>
    );
}
