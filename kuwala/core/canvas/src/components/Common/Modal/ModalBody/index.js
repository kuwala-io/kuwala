import React from "react";

const ModalBody = ({children}) => {
    return (
        <div
            className="flex flex-col modal-body overflow-y-scroll relative px-6 pt-2 pb-4"
        >
            {children}
        </div>
    )
}

export default ModalBody;