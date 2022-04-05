import React from "react";
import cn from "classnames"

const baseSize = {
    sm: "px-4 py-1.5 rounded-md",
    base: "px-6 py-2 rounded-lg",
    lg: "px-8 py-4 rounded-lg"
};

const baseVariant = {
    primary: "bg-kuwala-green text-white hover:text-stone-300"
}

const ButtonBase = (props) => {
    const {
        size="base",
        className,
        as="button",
        variant="primary",
        ...restProps
    } = props;
    const Element = as;

    return <Element
        {...restProps}
        className={cn(
            `font-semibold cursor-pointer`,
            baseSize[size],
            baseVariant[variant],
            className,
        )}
    />
}

export {
    ButtonBase
}