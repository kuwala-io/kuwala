import React from "react";
import {COLOR_MAP} from "../../../constants/styling";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const baseSize = {
    "xs": {
        width: 24,
        height: 24,
    },
    "sm": {
        width: 36,
        height: 36,
    },
    "md": {
        width: 48,
        height: 48,
    },
    "lg": {
        width: 56,
        height: 56,
    },
    "xl": {
        width: 64,
        height: 64,
    },
}

export default ({
        icon='cogs',
        size='md',
        color='kuwalaGreen'
    }) => {
    return (
        <FontAwesomeIcon
            icon={icon}
            style={{
                width: baseSize[size].width,
                height: baseSize[size].height,
                color: COLOR_MAP[color],
            }}
            className={'user-select-none'}
            draggable={false}
        />
    );
};