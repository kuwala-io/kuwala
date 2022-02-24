import React, {useState} from "react";



export default ({isDataTableHidden=true}) => {
    const [dataView, setDataView] = useState('data')
    console.log(isDataTableHidden)
    return (
        // Table Wrapper
        <div
            className={`
                flex
                flex-col
                absolute 
                left-1/2 
                bottom-0
                transform
                -translate-x-1/2 
                h-2/6
                w-8/12
                ${isDataTableHidden ? 'hidden' : ''}
                z-40
                `
            }
        >
            <div className={'flex flex-row items-center justify-center relative p-2'}>
                <div className="rounded-md bg-white border-2 border-kuwala-green">
                    <div className="inline-flex">
                        <input
                            type="radio"
                            checked
                            hidden
                        />
                        <label htmlFor="roomPrivate"
                               className="radio text-center bg-kuwala-green text-white self-center py-2 px-4 rounded-sm cursor-pointer hover:opacity-75">Table View</label>
                    </div>
                    <div className="inline-flex rounded-lg">
                        <input
                            type="radio"
                            hidden
                        />
                        <label htmlFor="roomPublic" className="radio bg-white text-kuwala-green text-center self-center py-2 px-4 rounded-lg cursor-pointer hover:opacity-75">Variable View</label>
                    </div>
                </div>
            </div>
            <div className={'relative w-full flex-1 overflow-y-scroll'}>
                <table className="table-auto w-full rounded-t-md">
                    <thead className={'rounded-t-md uppercase'}>
                    <tr>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Date</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Campaign Start</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Campaign End</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Revenue Total</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Revenue Campaign</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Units</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Avg Unit Price</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Longitude</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Latitude</th>
                    </tr>
                    </thead>
                    <tbody className={''}>
                        {[...Array(100)].map((e,i) => (
                            <tr className={'bg-white border-2 text-center'}>
                                <td className={'py-6'}>11/01/2021</td>
                                <td className={'py-6'}>01.01.2021</td>
                                <td className={'py-6'}>01.12.2021</td>
                                <td className={'py-6'}>70,078</td>
                                <td className={'py-6'}>10,028</td>
                                <td className={'py-6'}>203</td>
                                <td className={'py-6'}>50,78</td>
                                <td className={'py-6'}>123,456</td>
                                <td className={'py-6'}>456,789</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}