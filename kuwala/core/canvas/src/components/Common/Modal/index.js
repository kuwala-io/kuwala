import React from "react";
import ModalBody from "./ModalBody";
import ModalHeader from "./ModalHeader";
import ModalFooter from "./ModalFooter";

const Modal =  ({isShow: isOpen, children}) => {
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
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;
export {
    ModalFooter,
    ModalHeader,
    ModalBody,
}