import React from "react";
import Header from "../components/Header";
import {useLocation, Link} from "react-router-dom";
import {useStoreState} from "easy-peasy";

import ListSVG from "../icons/list.svg"
import ArrowRight from "../icons/arrow-right-solid.svg"
import ArrowDown from "../icons/arrow-down-solid.svg"

export default () => {

    const location = useLocation()
    const dataIndex = location.state.index
    const { dataSource } = useStoreState((state) => state.canvas);
    const selectedSource = dataSource.filter((el) => el.id === dataIndex)[0];

    const renderDataPreview = () => {
        if(!selectedSource) {
            return (
                <div>
                    Undefined data source, something is wrong.
                </div>
            )
        }else {
            return (
                <div className={'flex flex-row bg-white border-2 border-kuwala-green rounded-lg h-full w-full'}>
                    <div className={'flex flex-col bg-white w-1/6 border-2 border-kuwala-green'}>
                        <div className={'bg-kuwala-green w-full px-4 py-2 text-white font-semibold'}>
                            Database: Kuwala
                        </div>
                        <div>
                            <div className={'flex flex-row items-center w-full px-4 py-2 bg-white'}>
                                <span className={'mr-4 cursor-pointer'}
                                >
                                    <img
                                        src={ArrowRight}
                                        style={{width: 16, height: 16}}
                                    />
                                </span>
                                <span className={'mr-4'}
                                >
                                    <img
                                        src={ListSVG}
                                        style={{width: 16, height: 16}}
                                    />
                                </span>
                                <span className={'font-semibold text-md'}>
                                    Canvas
                                </span>
                            </div>
                            <div className={'flex flex-col w-full bg-white'}>
                                <div className={'flex flex-row items-center px-4 py-2'}>
                                    <span className={'mr-4 cursor-pointer'}>
                                    <img
                                        src={ArrowDown}
                                        style={{width: 16, height: 16}}
                                    />
                                    </span>
                                        <span className={'mr-4'}>
                                        <img
                                            src={ListSVG}
                                            style={{width: 16, height: 16}}
                                        />
                                    </span>
                                    <span className={'font-semibold text-md'}>
                                        Canvas
                                    </span>
                                </div>

                                <div className={'flex flex-col'}>
                                    <div className={'flex flex-row items-center px-12 py-2 bg-kuwala-light-green'}>
                                        <span className={'mr-4 cursor-pointer'}>
                                        <img
                                            src={ArrowDown}
                                            style={{width: 16, height: 16}}
                                        />
                                        </span>
                                            <span className={'mr-4'}>
                                            <img
                                                src={ListSVG}
                                                style={{width: 16, height: 16}}
                                            />
                                        </span>
                                            <span className={'font-semibold text-md'}>
                                            Canvas
                                        </span>
                                    </div>
                                    <div className={'flex flex-row items-center px-12 py-2'}>
                                        <span className={'mr-4 cursor-pointer'}>
                                        <img
                                            src={ArrowDown}
                                            style={{width: 16, height: 16}}
                                        />
                                        </span>
                                        <span className={'mr-4'}>
                                            <img
                                                src={ListSVG}
                                                style={{width: 16, height: 16}}
                                            />
                                        </span>
                                        <span className={'font-semibold text-md'}>
                                            Canvas
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={'flex flex-col bg-white w-5/6 overflow-auto'}>
                        <table className={'bg-white'}>
                            <thead>
                            <tr>
                                <th className={'bg-kuwala-light-green text-white lowercase px-4 py-2'}>Header 1</th>
                                <th className={'bg-kuwala-light-green text-white lowercase px-4 py-2'}>Header 2</th>
                                <th className={'bg-kuwala-light-green text-white lowercase px-4 py-2'}>Header 3</th>
                                <th className={'bg-kuwala-light-green text-white lowercase px-4 py-2'}>Header 4</th>
                                <th className={'bg-kuwala-light-green text-white lowercase px-4 py-2'}>Header 5</th>
                            </tr>
                            </thead>
                            <tbody>
                                {[...Array(100).keys()].map((e) => {
                                    console.log(e)
                                    return (
                                        <tr>
                                            <td className={'text-left px-4 py-2 border border-kuwala-light-green'}>THINGS</td>
                                            <td className={'text-left px-4 py-2 border border-kuwala-light-green'}>THINGS</td>
                                            <td className={'text-left px-4 py-2 border border-kuwala-light-green'}>THINGS</td>
                                            <td className={'text-left px-4 py-2 border border-kuwala-light-green'}>THINGS</td>
                                            <td className={'text-left px-4 py-2 border border-kuwala-light-green'}>THINGS</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
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
                            Data Pipeline Preview
                        </span>
                        <span className={'font-light text-xl mt-3'}>
                            Explore the data
                        </span>
                    </div>
                </div>

                {/* Data Sources Container*/}
                <div className={'mt-6 h-4/6 space-x-8 overflow-x-hidden'}>
                    {renderDataPreview()}
                </div>

                <div className={'flex'}>
                    <Link
                        className={'bg-kuwala-green text-white rounded-md px-4 py-2 mt-4 hover:text-stone-300'}
                        to={'/data-pipeline-management'}
                    >
                        Back
                    </Link>
                </div>
            </main>
        </div>
    )
}