import React, {useEffect} from "react";
import Header from "../components/Header";
import {useNavigate, Link} from "react-router-dom";
import {useStoreActions, useStoreState} from "easy-peasy";
import {data} from "autoprefixer";

export default () => {
    const navigate = useNavigate()
    const { selectedDataSource, dataSource } = useStoreState((state) => state.canvas)
    const { addDataSource } = useStoreActions((actions) => actions.canvas)

    useEffect(()=> {
        if(selectedDataSource.length > 0){
            addDataSource(...selectedDataSource)
        }
    }, [])

    const renderPipelineManager = () => {
        if(selectedDataSource.length <= 0 && dataSource.length <= 0) {
            return (
                <div>
                    No data source is selected, please add a new data source from the <Link to={'/data-catalog'} className={'text-kuwala-green'}>Data Catalog</Link>
                </div>
            )
        } else if (dataSource.length > 0){
            return (
                <table className="table-fixed w-full whitespace-nowrap rounded-t-md">
                    <thead className={'rounded-t-md uppercase'}>
                    <tr>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Name</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Status</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                        {dataSource.map((e, i)=>{
                            return (
                                <tr
                                    key={i} className={'bg-white border-2 text-center py-1'}
                                    // style={{height: 64, width: 64}}
                                >
                                    <td className="px-4 py-4">Intro to CSS</td>
                                    <td className="px-4 py-4">Adam</td>
                                    <td className="px-4 py-4">858</td>
                                    {/*<td className={'py-1'}>*/}
                                    {/*    <div className={'flex flex-row'}>*/}
                                    {/*        <img*/}
                                    {/*            src={e.logo}*/}
                                    {/*            style={{height: 48, width: 48}}*/}
                                    {/*        />*/}
                                    {/*        <label>{e.name}</label>*/}
                                    {/*    </div>*/}
                                    {/*</td>*/}
                                    {/*<td className={'py-1'}>Active</td>*/}
                                    {/*<td className={'py-1 space-x-2'}>*/}
                                    {/*    <button className={'bg-kuwala-green px-2 py-1 text-white rounded-md'}>*/}
                                    {/*        Configure*/}
                                    {/*    </button>*/}
                                    {/*    <button className={'bg-kuwala-green px-2 py-1 text-white rounded-md'}>*/}
                                    {/*        Preview Data*/}
                                    {/*    </button>*/}
                                    {/*</td>*/}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )
        }
    }

    return (
        <div className={`flex flex-col h-screen overflow-y-hidden antialiased text-gray-900`}>
            <Header />
            <main className={'flex flex-col h-full w-full bg-kuwala-bg-gray py-12 px-20'}>
                <span className={'font-semibold text-3xl'}>
                    Data Pipeline Management
                </span>
                <span className={'font-light text-xl mt-3'}>
                    Configure and manage your selected data sources here
                </span>

                {/* Data Sources Container*/}
                <div className={'mt-10 h-5/6 space-x-8 flex flex-row'}>
                    {renderPipelineManager()}
                </div>

                <div className={'flex flex-row-reverse'}>
                    <button
                        className={'bg-kuwala-green text-white rounded-md px-4 py-2 mt-4 hover:text-stone-300'}
                        onClick={()=>{
                            navigate('/')
                        }}
                    >
                        Go To Canvas
                    </button>
                </div>
            </main>
        </div>
    )
}