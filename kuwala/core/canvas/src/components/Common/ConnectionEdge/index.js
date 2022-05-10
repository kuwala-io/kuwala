import React from 'react';
import {getBezierPath, getEdgeCenter} from 'react-flow-renderer';
import {KUWALA_GREEN, KUWALA_LIGHT_GREEN} from "../../../constants/styling";
import {useStoreActions} from "easy-peasy";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function CustomEdge({
           id,
           sourceX,
           sourceY,
           targetX,
           targetY,
           sourcePosition,
           targetPosition,
           markerEnd,
           selected
       }) {
    const edgePath = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    const foreignObjectSize = 40;
    const [edgeCenterX, edgeCenterY] = getEdgeCenter({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });
    const {removeElementById} = useStoreActions((actions => actions.canvas));

    return (
        <>
            <path
                id={`selector_${id}`}
                className="react-flow__edge-path-selector"
                d={edgePath}
                markerEnd={markerEnd}
                fillRule="evenodd"
            />
            <path
                id={id}
                style={{
                    strokeWidth: 6,
                    stroke: selected ? KUWALA_GREEN : KUWALA_LIGHT_GREEN
                }}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
                fillRule="evenodd"
            />
            <foreignObject
                width={foreignObjectSize}
                height={foreignObjectSize}
                x={edgeCenterX+6 - foreignObjectSize / 2}
                y={edgeCenterY+4 - foreignObjectSize / 2}
                className={`edgebutton-foreignobject ${selected ? '' : 'hidden'}`}
                requiredExtensions="http://www.w3.org/1999/xhtml"
            >
                <button
                    className={`
                        rounded-full bg-kuwala-light-green h-8 w-8 
                        text-white font-semibold 
                        hover:bg-kuwala-green active:shadow-lg
                    `}
                    onClick={() => removeElementById(id)}
                >
                    <FontAwesomeIcon icon={'times'}/>
                </button>
            </foreignObject>
        </>
    );
}
