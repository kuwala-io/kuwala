import React from "react";

export default ({size='base'}) => {
    const sizeMap = {
        base: `w-6 h-6`,
        xl: `w-24 h-24`
    }

    return (
       <div
           className={`spinner-border animate-spin inline-block ${sizeMap[size]} border-4 rounded-full`}
           role="status">
           <span className="visually-hidden">Loading...</span>
       </div>
    )
}