import React from 'react';

import { Handle } from 'react-flow-renderer';

const TransformationNode = (({ data }) => {
    return (
        <div
            className={'bg-white border border-stone-500 flex flex-col'}
        >
            <div
                className={'text-xs text-center'}
            >
                <Handle
                    className={`
                        h-full
                    `}
                    style={{
                        backgroundColor: '#78716c',
                        width: 36,
                        left: -30,
                        height: '100%',
                        borderRadius: 0,
                        border: 'medium none',
                        borderTopLeftRadius: 12,
                        borderBottomLeftRadius: 12,
                    }}
                    d={`${data.id}`}
                    type="target"
                    position="left"
                    isConnectable
                />

                {/* BODY */}
                <div style={{
                    paddingRight: 36,
                    paddingLeft: 36,
                    paddingTop: 20,
                    paddingBottom: 20
                }}>
                    Transformation Node
                </div>

                <Handle
                    className={`
                        h-full
                    `}
                    style={{
                        backgroundColor: '#78716c',
                        width: 36,
                        right: -30,
                        height: '100%',
                        borderRadius: 0,
                        border: 'medium none',
                        borderTopRightRadius: 12,
                        borderBottomRightRadius: 12,
                    }}
                    d={`${data.id}`}
                    type="source"
                    position="right"
                    isConnectable
                />
            </div>
        </div>
    );
});

export default TransformationNode;