import React from "react";

export default () => {
 return (
    <div
        className="spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full"
        role="status">
        <span className="visually-hidden">Loading...</span>
    </div>
 )
}