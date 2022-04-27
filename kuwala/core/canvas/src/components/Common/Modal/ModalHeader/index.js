import React from "react";

const ModalHeader = ({children}) => {
    return (
        <div
            className="modal-header flex flex-col flex-shrink-0 justify-between px-6 py-4 rounded-t-md"
        >
            {children}
        </div>
    )
}

export default ModalHeader;