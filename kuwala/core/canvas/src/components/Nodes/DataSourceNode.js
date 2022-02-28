import React from 'react';

import { Handle } from 'react-flow-renderer';
import {useStoreActions} from "easy-peasy";

const DataSourceNode = (({ data }) => {
    return (
        <div
            className={'bg-white border border-kuwala-green flex flex-col'}
        >
            <div
                className={'text-xs text-center'}
            >
                {/* BODY */}
                <div style={{
                    paddingRight: 36,
                    paddingLeft: 36,
                    paddingTop: 20,
                    paddingBottom: 20
                }}>
                    Data Source Node
                </div>

                <Handle
                    className={`
                        h-full
                        bg-kuwala-green
                    `}
                    style={{
                        backgroundColor: '#00A99D',
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

export default DataSourceNode;