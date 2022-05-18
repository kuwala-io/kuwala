import React from "react";
import { baseButtonStyle }from './SwitcherStyle'

const Switcher = ({ leftId, leftText, onClick, rightId, rightText, selectedId }) => {
    return (
        <div className={'flex flex-row justify-center items-center p-8'}>
            <div className={'flex flex-row '}>
                <div
                    className={`
                          ${baseButtonStyle}
                          border-b-2 border-t-2 border-l-2 border-kuwala-green
                          rounded-l-lg
                          ${selectedId === leftId ? 'bg-kuwala-green text-white' : 'bg-white text-kuwala-green'}
                      `}
                    onClick={() => {onClick(leftId)}}
                    draggable={false}
                >
                    {leftText}
                </div>

                <div
                    className={`
                        ${baseButtonStyle}
                        border-b-2 border-t-2 border-r-2 border-kuwala-green
                        rounded-r-lg
                        ${selectedId === rightId ? 'bg-kuwala-green text-white' : 'bg-white text-kuwala-green'}
                    `}
                    onClick={() => {onClick(rightId)}}
                    draggable={false}
                >
                    {rightText}
                </div>
            </div>
        </div>
    );
}

export default Switcher;
