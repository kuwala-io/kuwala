import Icon from "../../Common/Icon";
import React from "react";
import {TextInput} from "../../Common";

const TransformationBlockConfigHeader = ({ onNameChange, selectedElement, transformationBlockName }) => {
    return (
        <div className={'flex flex-row px-6 py-2'}>
            <div className={'flex flex-col items-center'}>
                <div
                    className={'flex flex-col justify-center items-center bg-white rounded-xl drop-shadow-lg relative p-4 w-24 h-24'}
                >
                    <Icon
                        icon={selectedElement.data.transformationCatalog.categoryIcon}
                        size={'lg'}
                        color={'kuwalaPurple'}
                    />
                    <span className={'mt-1 text-sm capitalize'}>{selectedElement.data.transformationCatalog.category}</span>
                </div>
            </div>

            <div className={'flex flex-col ml-6 space-y-2 bottom-0 justify-end mb-2'}>
                <span className={'px-3 py-1 bg-kuwala-light-purple text-kuwala-purple font-semibold rounded-lg w-52'}>
                    Transformation Block
                </span>

                <TextInput
                    color={"purple"}
                    label={"Name"}
                    onChange={onNameChange}
                    value={transformationBlockName}
                />
            </div>
        </div>
    )
}

export default TransformationBlockConfigHeader;