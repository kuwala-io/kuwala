import React from 'react';

import { Handle } from 'react-flow-renderer';

const TransformationNode = (({ data }) => {
    return (
        <div
            className={'bg-white border border-kuwala-red flex flex-col'}
        >
            <div
                className={'text-xs text-center'}
            >
                <Handle
                    className={`
                        h-full
                        bg-kuwala-red
                    `}
                    style={{
                        backgroundColor: '#F5989D',
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
                    Visualization Node
                </div>

            </div>
        </div>
    );
});

export default TransformationNode;