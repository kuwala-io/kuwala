import React from "react";

const Spinner = ({size='base'}) => {
    const sizeMap = {
        base: `w-4 h-4`,
        xl: `w-24 h-24`
    }

    return (
        <div
            className={`spinner-border animate-spin inline-block ${sizeMap[size]} border-2 rounded-full`}
            role="status"
        />
    )
}

export default Spinner;
