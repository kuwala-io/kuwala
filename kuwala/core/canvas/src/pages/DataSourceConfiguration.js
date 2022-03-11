import React, {useEffect, useState} from "react";
import Header from "../components/Header";
import {useLocation, Link, useNavigate} from "react-router-dom";
import {useStoreActions, useStoreState} from "easy-peasy";
import { Formik, Field, Form, ErrorMessage, FieldArray } from "formik"
import { testConnection } from "../api/DataSourceApi";

export default () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dataIndex = location.state.index
    const { dataSource } = useStoreState((state) => state.canvas);
    const { saveDataSourceConfig } = useStoreActions((actions) => actions.canvas);
    const selectedSource = dataSource.filter((el) => el.id === dataIndex)[0]
    const initialConnectionParameters = selectedSource ? selectedSource.connection_parameters : []
    const [isConnected, setIsConnected] = useState(false)
    const [isTestConnectionLoading, setIsTestConnectionLoading] = useState(false)
    const [isSaveLoading, setIsSaveLoading] = useState(false)
    const [testConnectionClicked, setTestConnectionClicked] = useState(false)

    useEffect(()=>{
        if(selectedSource){
            setIsConnected(typeof selectedSource.connected === 'undefined' ? false : selectedSource.connected)
        }
    }, [selectedSource])

    const testConfigConnection = async ({dataSourceId, config}) => {
        setIsTestConnectionLoading(true)
        const res = await testConnection({
            id: dataSourceId,
            config: parseArrayIntoConfig(config)
        });

        if(res.status === 200){
            const connected = res.data.connected;
            setIsConnected(connected)
        }
        setIsTestConnectionLoading(false)
        setTestConnectionClicked(true)
    }

    const parseArrayIntoConfig = (arr) => {
        return {
            "host": getValue(arr,'host'),
            "port": parseInt(getValue(arr,'port')),
            "user": getValue(arr,'user'),
            "password": getValue(arr,'password'),
            "database": getValue(arr,'database')
        }
    }

    const getValue = (arr, key) => {
        return arr.filter((item) => item.id === key)[0].value
    }

    const renderDataSourceConfigForm = ({values}) => {
        if(!selectedSource || !values.connection_parameters) {
            return (
                <div>
                    Undefined data source, something is wrong.
                </div>
            )
        }else {
            return (
                <Form>
                    <FieldArray name={'connection_parameters'}
                        render={arrayHelpers => {
                            return (
                                <div className={'flex flex-col bg-white px-8 py-4 rounded-lg h-full'}>
                                    {values.connection_parameters.map((conParams,i) => {
                                        return (
                                            <div className={'flex flex-row h-full w-full items-center space-y-8'}
                                                key={conParams.id}
                                            >
                                                <div className={'w-1/6'}>
                                                    <span className={'text-lg capitalize font-bold'}>
                                                        {conParams.id}
                                                    </span>
                                                </div>
                                                <div className={'w-5/6'}>
                                                    <Field
                                                        name={`connection_parameters[${i}].value`}
                                                        type={conParams.id === 'password' ? 'password' : 'text'}
                                                        className={'w-full px-4 py-2 border-2 border-kuwala-green text-gray-800 rounded-lg focus:outline-none'}
                                                        placeholder={conParams.id}
                                                        key={conParams.id}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div className={'flex flex-row justify-between mt-6'}>
                                        <div className={'flex flex-row align-middle items-center justify-center mt-4'}>
                                            <button
                                                className={`bg-white border-2 border-kuwala-green rounded-md px-3 w-48 py-2 hover:text-stone-300 hover:bg-kuwala-bg-gray`}
                                                onClick={async ()=> {
                                                    setIsTestConnectionLoading(true)
                                                    await testConfigConnection({
                                                        dataSourceId: selectedSource.id,
                                                        config: values.connection_parameters
                                                    })
                                                }}
                                                type={'button'}
                                                disabled={isTestConnectionLoading}
                                            >
                                            <span className={'text-kuwala-green w-full py-2'}>
                                                {isTestConnectionLoading ?
                                                    <div className="flex justify-center items-center">
                                                        <div
                                                            className="spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full"
                                                            role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                    :
                                                    'Test Connection'
                                                }
                                            </span>
                                            </button>
                                            <span className={`ml-8 text-md font-semibold
                                                ${isConnected ? 'text-kuwala-green' : 'text-kuwala-red'}
                                                ${testConnectionClicked ? '' : 'hidden'}
                                            `}>
                                                {isConnected ? 'Success!' : 'Failed'}
                                            </span>
                                        </div>
                                        <button
                                            className={'bg-kuwala-green rounded-md px-3 w-24 py-2 mt-4'}
                                            type={'submit'}
                                            disabled={isSaveLoading}
                                        >
                                            <span className={'text-white hover:text-stone-300 w-full py-2'}>
                                                {isSaveLoading ?
                                                    <div className="flex justify-center items-center">
                                                        <div
                                                            className="spinner-border animate-spin inline-block w-6 h-6 border-4 text-white rounded-full"
                                                            role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                    :
                                                    'Save'
                                                }
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )
                        }}
                    />
                </Form>
            )
        }
    }

    const renderSelectedSource = () => {
        if(!selectedSource) {
            return <></>
        }else {
            return (
                <div
                    className={'flex flex-col justify-center items-center bg-white rounded-xl drop-shadow-lg relative'}
                    style={{width: 148, height:148}}
                >
                    <img
                        src={selectedSource.logo}
                        style={{height: 72, width: 72}}
                    />
                    <span className={'mt-1'}>{selectedSource.name}</span>
                    <div
                        className={`
                            absolute right-0 top-0 p-1 border rounded-full w-7 h-7 -mr-2 -mt-2
                            ${isConnected ? "bg-kuwala-green" : "bg-red-400"}
                            `}
                    />
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
                    <Formik
                        initialValues={{
                            connection_parameters: initialConnectionParameters
                        }}
                        onSubmit={async (values)=>{
                            console.log(parseArrayIntoConfig(values.connection_parameters))
                            setIsSaveLoading(true)
                            await saveDataSourceConfig({
                                id: selectedSource.id,
                                config: parseArrayIntoConfig(values.connection_parameters)
                            })
                            setIsSaveLoading(false)
                            setTestConnectionClicked(true)
                        }}
                        children={renderDataSourceConfigForm}
                    />
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