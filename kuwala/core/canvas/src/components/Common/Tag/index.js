import React from "react";
import {tagStyle} from './TagStyle'

const Tag = ({ color = 'green', size = 'base', text }) => {
    let colorStyle;

    // Doing the switch case because making the color properties dynamic caused rendering problems for unknown reasons
    switch (color) {
        case 'red':
            colorStyle = 'bg-kuwala-light-red text-kuwala-red';
            break;
        case 'purple':
            colorStyle = 'bg-kuwala-light-purple text-kuwala-purple';
            break;
        case 'gray':
            colorStyle = 'bg-gray-100 text-gray-400';
            break;
        default:
            colorStyle = 'bg-kuwala-light-green text-kuwala-green';
    }

    return (
        <div className={`${tagStyle} ${colorStyle} text-${size}`}>
            {text}
        </div>
    );
};

export default Tag;
