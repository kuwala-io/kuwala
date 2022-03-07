import React from "react";
import Header from "../components/Header";
import {useLocation, Link} from "react-router-dom";
import {useStoreState} from "easy-peasy";

export default () => {

    const location = useLocation()
    const dataIndex = location.state.index
    const { dataSource } = useStoreState((state) => state.canvas);
    const selectedSource = dataSource[dataIndex]

    const renderDataSourceConfig = () => {
        if(!selectedSource) {
            return (
                <div>
                    Undefined data source, something is wrong.
                </div>
            )
        }else {
            console.log(selectedSource)
            return (
                <div className={'flex flex-col bg-white px-8 py-4 rounded-lg h-full'}>
                    {selectedSource.connection_parameters.map((e,i) => {
                        return (
                            <div className={'flex flex-row h-full w-full items-center'}>
                                <div className={'w-1/6'}>
                                    <span className={'text-lg capitalize font-bold'}>
                                        {e.id}
                                    </span>
                                </div>
                                <div className={'w-5/6'}>
                                    <input
                                        type="search"
                                        className="w-full px-4 py-2 border-2 border-kuwala-green text-gray-800 capitalize rounded-lg focus:outline-none"
                                        placeholder={e.id}
                                    />
                                </div>
                            </div>
                        )
                    })}
                    <div className={'flex flex-row justify-between mt-6'}>
                        <button
                            className={'bg-white border-2 border-kuwala-green rounded-md px-3 py-2 mt-4 hover:text-stone-300'}
                        >
                            <span className={'text-kuwala-green'}>Check Connection</span>
                        </button>
                        <button
                            className={'bg-kuwala-green rounded-md px-3 py-2 mt-4 hover:text-stone-300'}
                        >
                            <span className={'text-white'}>Save</span>
                        </button>
                    </div>
                </div>
            )
        }
    }

    const renderSelectedSource = () => {
        if(!selectedSource) {
            return <></>
        }else {
            return (
                <div
                    className={'flex flex-col justify-center items-center bg-white rounded-xl drop-shadow-lg'}
                    style={{width: 148, height:148}}
                >
                    <img
                        src={selectedSource.logo}
                        style={{height: 72, width: 72}}
                    />
                    <span className={'mt-1'}>{selectedSource.name}</span>
                </div>
            )

        }
    }

    return (
        <div className={`flex flex-col h-screen overflow-y-hidden antialiased text-gray-900`}>
            <Header />
            <main className={'flex flex-col h-full w-full bg-kuwala-bg-gray py-12 px-20'}>
                <div className={'flex flex-row'}>
                    {renderSelectedSource()}

                    <div className={`flex flex-col ${selectedSource ? 'ml-12 justify-center' : ''}`}>
                        <span className={'font-semibold text-3xl'}>
                            Data Pipeline Configuration
                        </span>
                        <span className={'font-light text-xl mt-3'}>
                            Setup and configure your data pipeline
                        </span>
                    </div>
                </div>

                {/* Data Sources Container*/}
                <div className={'mt-6 h-4/6 space-x-8 overflow-x-hidden'}>
                    {renderDataSourceConfig()}
                </div>

                <div className={'flex'}>
                    <Link
                        className={'bg-kuwala-green text-white rounded-md px-4 py-2 mt-4 hover:text-stone-300'}
                        to={'/data-pipeline-management'}
                    >
                        Back to Pipeline Manager
                    </Link>
                </div>
            </main>
        </div>
    )
}