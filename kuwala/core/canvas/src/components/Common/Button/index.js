import React from "react";
import cn from "classnames"
import Spinner from "../Spinner";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const baseSize = {
    longXs: "px-4 py-1 rounded-lg",
    sm: "px-4 py-1.5 rounded-md",
    base: "px-4 py-2 rounded-md",
    mid: "px-6 py-3 rounded-md",
    lg: "px-8 py-4 rounded-lg"
};

const primaryVariant = {
    kuwalaGreen: "bg-kuwala-green text-white",
    kuwalaRed: "bg-kuwala-red text-white",
    kuwalaPurple: "bg-kuwala-purple text-white",
    kuwalaGray: "bg-kuwala-gray text-white",
}

const secondaryVariant = (color, selected) => {
    switch (color){
        case('kuwalaRed'):
            return `
                border border-kuwala-red space-x-2
                ${selected ? 'bg-kuwala-red text-white' : 'bg-white text-kuwala-red'} 
                hover:bg-kuwala-red hover:text-white cursor-pointer`
        case('kuwalaPurple'):
            return `
                border border-kuwala-purple space-x-2
                ${selected ? 'bg-kuwala-purple text-white' : 'bg-white text-kuwala-purple'} 
                hover:bg-kuwala-purple hover:text-white cursor-pointer`
        case('kuwalaGreen'):
            return `
                border border-kuwala-green space-x-2
                ${selected ? 'bg-kuwala-green text-white' : 'bg-white text-kuwala-green'} 
                hover:bg-kuwala-green hover:text-white cursor-pointer`
        case('kuwalaGray'):
            return `
                border border-kuwala-gray space-x-2
                ${selected ? 'bg-kuwala-gray text-white' : 'bg-white text-kuwala-gray'} 
                hover:bg-kuwala-gray hover:text-white cursor-pointer`
        default:
            return `
                px-4 py-2 border rounded-md border-kuwala-red space-x-2
                ${selected ? 'bg-kuwala-red text-white' : 'bg-white text-kuwala-red'} 
                hover:bg-kuwala-red hover:text-white cursor-pointer
            `
    }
}

const getButtonStylesBySolid = (solid, color, selected) => {
    if(solid) {
        return primaryVariant[color]
    }else {
        return secondaryVariant(color, selected)
    }
}

const getStyleForDisabled = (disabled) => {
    if(disabled) {
        return 'bg-stone-300 text-white hover:text-white cursor-not-allowed border-none';
    }
    return '';
}

const renderIconIfExists = (icon) => {
    if(icon) {
        return <FontAwesomeIcon
            icon={icon}
            className={'h-4 w-4'}
        />
    }
}

const Button = ({
    alignment = 'center',
    size="base",
    className,
    color="kuwalaGreen",
    disabled=false,
    onClick,
    loading=false,
    solid=true,
    selected=false,
    icon,
    text,
    draggable=false,
    type='button'
}) => {
    return (
        <button
            className={cn(
                `font-semibold cursor-pointer min-w-[96px] h-fit`,
                baseSize[size],
                disabled ? getStyleForDisabled(disabled) : getButtonStylesBySolid(solid, color, selected),
                className,
            )}
            disabled={disabled}
            onClick={onClick}
            draggable={draggable}
            type={type}
        >
            {
                loading
                ?
                    (
                        <Spinner />
                    )
                :
                    (
                        <div className={`flex flex-row items-center space-x-2 justify-${alignment}`}>
                            {renderIconIfExists(icon)}

                            <span>
                                {text}
                            </span>
                        </div>
                    )
            }
        </button>
    );
};

export default Button;