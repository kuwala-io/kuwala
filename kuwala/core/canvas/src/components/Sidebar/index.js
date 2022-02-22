import React from "react";

export default ({sidebar, toggleSidebar}) => {
    return (
        <div className={`
                            absolute
                            z-10
                            flex
                            flex-row
                            transition-all
                            transform
                            h-full
                            ${sidebar ? '-translate-x-full' : ''}`}
        >
            <div className={'relative w-64'}>
                <aside
                    className={`
                            inset-y-0
                            flex flex-col flex-shrink-0
                            w-64
                            overflow-hidden
                            bg-white
                            border-r
                            h-full
                            shadow-sm
                            top-0`
                    }
                >
                    {/* Header and Toggle */}
                    <div className={`flex items-center justify-between flex-shrink-0 p-2`}>
                        <span className={`p-2 text-xl font-semibold leading-8 tracking-wider uppercase whitespace-nowrap`}>
                            <span>Data Sources</span>
                        </span>
                    </div>
                </aside>
            </div>

            <div className={'relative'}>
                <button
                    onClick={toggleSidebar}
                    className={`
                                    ml-4
                                    mt-4
                                    w-12
                                    h-12
                                    rounded-lg 
                                    absolute
                                    text-2xl
                                    font-bold
                                    border-4
                                    border-kuwala-red
                                    bg-white
                                    text-kuwala-red
                                `}
                >
                    {sidebar ? '-' : '+'}
                </button>
            </div>
        </div>
    )
}