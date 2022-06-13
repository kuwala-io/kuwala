import React from "react";
import { Tag, TextInput } from '../../Common'

const DataBlockConfigHeader = ({ selectedElement, dataBlockName, onNameChange }) => {
    return (
        <div className={'flex flex-row px-6 py-2'}>
            <div className={'flex flex-col items-center'}>
                <div
                    className={'flex flex-col justify-center items-center bg-white rounded-xl drop-shadow-lg relative p-4 w-24 h-24'}
                >
                    <img
                        alt={"Data source logo"}
                        src={selectedElement.data.dataSource.logo}
                        style={{height: 48, width: 48}}
                        draggable={false}
                    />
                    <span className={'mt-1 text-sm'}>{selectedElement.data.dataSource.name}</span>
                    <div
                        className={`
                                absolute right-0 top-0 p-1 border rounded-full w-5 h-5 -mr-2 -mt-2
                                ${selectedElement.data.dataSource.connected ? "bg-kuwala-green" : "bg-red-400"}
                        `}
                    />
                </div>
            </div>

            <div className={'flex flex-col ml-6 space-y-2 bottom-0 justify-end mb-2'}>
                <Tag text={'Data block'} />

                <TextInput value={dataBlockName} onChange={onNameChange} label={'Name'} />
            </div>
        </div>
    )
}

export default DataBlockConfigHeader