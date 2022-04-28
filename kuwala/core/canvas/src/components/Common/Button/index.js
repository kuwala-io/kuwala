import React from "react";
import cn from "classnames"
import Spinner from "../Spinner";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const baseSize = {
    sm: "px-4 py-1.5 rounded-md",
    base: "px-4 py-2 rounded-md",
    lg: "px-8 py-4 rounded-lg"
};

const primaryVariant = {
    kuwalaGreen: "bg-kuwala-green text-white hover:text-stone-300",
    kuwalaRed: "bg-kuwala-red text-white hover:text-stone-300",
    kuwalaPurple: "bg-kuwala-purple text-white hover:text-stone-300"
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

const renderIconIfExists = (icon) => {
    if(icon) {
        return <FontAwesomeIcon
            icon={icon}
            className={'h-4 w-4'}
        />
    }
}

const Button = ({
        size="base",
        className,
        color="kuwalaGreen",
        disabled=false,
        onClick,
        loading=false,
        solid=true,
        selected=false,
        alignment='start',
        icon='',
        text='',
    }) => {
    return <button
        className={cn(
            `font-semibold cursor-pointer`,
            baseSize[size],
            getButtonStylesBySolid(solid, color, selected),
            className,
        )}
        disabled={disabled}
        onClick={onClick}
    >
        {
            loading
            ?
                (
                    <Spinner/>
                )
            :
                (
                    <div className={`
                        flex flex-row items-center space-x-2
                        ${alignment ? 'justify-'+alignment : ''}
                    `}>
                        {renderIconIfExists(icon)}
                        <span>
                            {text}
                        </span>
                    </div>
                )
        }
    </button>
}

export default Button;