import React from "react";

const ModalBase =  ({isShow, children, ...restProps}) => {
    return (
        <div
            className={`
                    modal
                    ${isShow ? '' : 'hidden'}
                    fixed 
                    top-0 left-0 
                    w-full h-screen outline-none 
                    overflow-x-hidden overflow-y-auto
                    bg-black
                    bg-opacity-50
                `}
            {...restProps}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-xl h-100 relative w-full pointer-events-none override-modal-dialog"
            >
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

const ModalHeader = ({children, ...restProps}) => {
    return (
        <div
            className="modal-header flex flex-col flex-shrink-0 justify-between px-6 py-4 rounded-t-md"
            {...restProps}
        >
            {children}
        </div>
    )
}

const ModalBody = ({children, ...restProps}) => {
    return (
        <div
            className="flex flex-col modal-body overflow-y-scroll relative px-6 pt-2 pb-4"
            {...restProps}
        >
            {children}
        </div>
    )
}

const ModalFooter = ({children, ...restProps}) => {
    return (
        <div
            className={'modal-footer'}
            {...restProps}
        >
            {children}
        </div>
    )
}

const ModalCloseButton = ({onClick, ...restProps}) => {
    return (
        <button
            type="button"
            className="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
            {...restProps}
            data-bs-dismiss="modal"
            aria-label="Close"
            onClick={()=> {
                onClick()
            }}
        />
    )
}

export {
    ModalBase,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton
}