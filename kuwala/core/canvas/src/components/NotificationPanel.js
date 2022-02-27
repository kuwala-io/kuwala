import React from "react";

const dummyNotification = 100;

export default ({isNotificationOpen, toggleNotification}) => {
    return (
        <div
            className={`
                      fixed 
                      inset-y-0 
                      right-0
                      flex
                      flex-col
                      bg-white
                      shadow-lg
                      w-80
                      p-4
                      z-40
                      ${isNotificationOpen ? 'static' : 'hidden'}
                    `}

        >
            {/* NOTIFICATION HEADER */}
            <div className='flex items-center justify-between flex-shrink-0'>
                <div className='flex items-center'>
                    <h6 className='p-2 text lg'>NOTIFICATION</h6>
                    <svg
                        className="w-6 h-6 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                </div>

                <button className="p-2 rounded-md focus:outline-none focus:ring" onClick={toggleNotification}>
                    <svg
                        className="w-6 h-6 text-gray-600"
                        xmlns="http://www.w3.org/2000/svg"j
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* NOTIFICATION BODY */}
            <div className='mt-4 md:mt-8 flex flex-col overflow-y-scroll'>
                {/* NOTIFICATION ITEM */}
                {[...Array(dummyNotification)].map((e,i) => (
                    <div className='p-2 border-b flex flex-col'>
                        <span className='text-sm font-semibold'>Notification Title</span>
                        <span className='text-sm'>Created a new short url</span>
                    </div>
                ))}
            </div>
        </div>
    )
}