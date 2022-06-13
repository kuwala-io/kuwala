import React from "react";

export default ({onClick}) => {
    return (
        <button
            type="button"
            className={`
                btn-close box-content w-4 h-4 p-1 
                text-black border-none rounded-none 
                opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 
                hover:text-black hover:opacity-75 hover:no-underline
            `}
            data-bs-dismiss="modal"
            aria-label="Close"
            onClick={onClick}
        />
    );
}