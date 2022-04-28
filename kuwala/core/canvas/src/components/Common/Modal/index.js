import React from "react";
import CloseButton from "../CloseButton";

const Modal =  ({isOpen, children, closeModalAction}) => {
    return (
        <div
            className={`
                    modal
                    ${isOpen ? '' : 'hidden'}
                    fixed 
                    top-0 left-0 
                    w-full h-screen outline-none 
                    overflow-x-hidden overflow-y-auto
                    bg-black
                    bg-opacity-50
                `}
        >
            <div
                className={`
                    modal-dialog 
                    modal-dialog-centered
                    modal-xl
                    h-100
                    relative
                    w-full
                    pointer-events-none
                    override-modal-dialog
                `}>
                <div
                    className={`
                        modal-content
                        border-none shadow-lg 
                        relative flex flex-col 
                        w-full pointer-events-auto 
                        bg-white bg-clip-padding rounded-md 
                        outline-none text-current
                        h-full
                `}>
                    <div
                        className="flex flex-row items-center justify-end flex-shrink-0 px-6 pt-4 rounded-t-md"
                    >
                        <CloseButton
                            onClick={closeModalAction}
                        />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;