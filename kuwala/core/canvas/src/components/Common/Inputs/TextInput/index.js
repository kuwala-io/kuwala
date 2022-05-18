import React from "react";

const TextInput = ({ color = 'green', label, onChange, placeholder, value }) => (
    <div className={'flex flex-row items-center'}>
        {label && <label className={'font-semibold'}>{label}</label>}

        <input
            key={1}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={`
                form-control
                block
                w-full                                   
                ml-2
                px-2
                py-0.5
                text-base
                font-light
                text-gray-700
                bg-gray-100 bg-clip-padding
                border border-solid border-kuwala-${color}
                rounded-lg
                transition
                ease-in-out
                m-0
                focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
            `}
        />
    </div>
);

export default TextInput;
