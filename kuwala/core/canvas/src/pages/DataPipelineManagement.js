import React, {useEffect, useState} from "react";
import Header from "../components/Header";
import {useNavigate, Link} from "react-router-dom";
import {useStoreActions, useStoreState} from "easy-peasy";
import "./styles/data-pipeline-management.style.css";
import {data} from "autoprefixer";

export default () => {
    const navigate = useNavigate()
    const { dataSource } = useStoreState((state) => state.canvas)
    const { getDataSources } = useStoreActions((actions) => actions.canvas)

    useEffect(()=> {
        getDataSources()
    }, [])

    const renderPipelineManager = () => {
        if(dataSource.length <= 0) {
            return (
                <div>
                    No data source is selected, please add a new data source from the <Link to={'/data-catalog'} className={'text-kuwala-green'}>Data Catalog</Link>
                </div>
            )
        } else if (dataSource.length > 0){
            return (
                <table className="table-fixed w-full">
                    <thead className={'rounded-t-md uppercase'}>
                    <tr>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Name</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}>Status</th>
                        <th className={'sticky top-0 px-6 py-3 text-white bg-kuwala-green'}/>
                    </tr>
                    </thead>
                    <tbody>
                    {dataSource.map((e, i)=>{
                        return (
                            <tr
                                key={i} className={'bg-white border-2 text-center'}
                            >
                                <td className={'py-6'}>
                                    <div className={'flex flex-row ml-8 items-center'}>
                                        <img
                                            src={e.logo}
                                            style={{height: 48, width: 48}}
                                        />
                                        <label className={'ml-10 text-lg font-medium'}>{e.name}</label>
                                    </div>
                                </td>
                                <td className={'py-6'}>
                                    <span
                                        className={`
                                            px-4 py-2 rounded-xl text-white font-semibold
                                            ${e.connected ? 'bg-kuwala-green' : 'bg-red-400'}
                                        `}
                                    >
                                        {e.connected ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className={'py-6 space-x-2'}>
                                    <Link
                                        to={'/data-source-config'}
                                        state={{
                                            index: i,
                                        }}
                                        className={'bg-white px-4 py-2 text-white rounded-md border-2 border-kuwala-green hover:bg-kuwala-bg-gray'}
                                    >
                                        <span className={'text-kuwala-green font-semibold'}>Configure</span>
                                    </Link>
                                    <Link
                                        disabled={e.connected}
                                        to={'/data-source-preview'}
                                        state={{
                                            index: i,
                                        }}
                                        className={`
                                            bg-white text-kuwala-green px-4 py-2 text-white rounded-md border-2 border-kuwala-green hover:bg-kuwala-bg-gray
                                            ${e.connected ? '' : 'hidden'}
                                        `}
                                    >
                                        <span className={'text-kuwala-green font-semibold'}>Preview Data</span>
                                    </Link>
                                </td>
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
                    Configure and manage your selected data sources
                </span>

                {/* Data Sources Container*/}
                <div className={'mt-10 h-5/6 space-x-8 overflow-x-hidden'}>
                    {renderPipelineManager()}
                </div>

                <div className={'flex flex-row-reverse'}>
                    <button
                        className={'bg-kuwala-green text-white rounded-md px-4 py-2 mt-4 hover:text-stone-300'}
                        onClick={()=>{
                            navigate('/')
                        }}
                    >
                        Go to canvas
                    </button>
                </div>
            </main>
        </div>
    )
}