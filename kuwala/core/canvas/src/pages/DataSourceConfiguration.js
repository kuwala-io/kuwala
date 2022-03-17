import React, {useEffect, useState} from "react";
import Header from "../components/Header";
import {useLocation, Link, useNavigate} from "react-router-dom";
import {useStoreActions, useStoreState} from "easy-peasy";
import { Formik, Field, Form, FieldArray } from "formik"
import {saveConnection, testConnection} from "../api/DataSourceApi";
import { BIG_QUERY_PLACEHOLDER } from "../constants/placeholder"

export default () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dataIndex = location.state.index
    const { dataSource } = useStoreState((state) => state.canvas);
    const { getDataSources } = useStoreActions((actions) => actions.canvas);
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

    const saveConfiguration = async ({dataSourceId, config}) => {
        setIsSaveLoading(true)
        try {
            const res = await saveConnection({
                id: dataSourceId,
                config: generateConfig(selectedSource.data_catalog_item_id, config)
            })
            if(res.status === 200) {
                await getDataSources() // Refresh
            }
        } catch (e) {
            setIsConnected(false)
            alert("Failed to save configuration")
        }
        setIsSaveLoading(false)
        setTestConnectionClicked(true)
        navigate('/data-pipeline-management')
    }

    const testConfigConnection = async ({dataSourceId, config}) => {
        setIsTestConnectionLoading(true)
        try {
            const res = await testConnection({
                id: dataSourceId,
                config: generateConfig(selectedSource.data_catalog_item_id, config)
            });
            if(res.status === 200){
                const connected = res.data.connected;
                setIsConnected(connected)
            }
        } catch (e) {
            setIsConnected(false)
            alert("Failed to test connection")
        }
        setIsTestConnectionLoading(false)
        setTestConnectionClicked(true)
    }

    const preProcessConnectionParameters = (connectionParameters) => {
        if(selectedSource) {
            switch (selectedSource.data_catalog_item_id) {
                case 'postgres':
                    return connectionParameters
                case 'bigquery':
                    return connectionParameters.map((el) => {
                        const stringValue = JSON.stringify(el.value,null, 2)
                        const newValue = stringValue.length === 2 ? '' : stringValue
                        return {
                            ...el,
                            value: newValue
                        }
                    })
                    break;
                default:
                    return connectionParameters
            }
        }
        return connectionParameters

    }

    const generateConfig = (type, config) => {
        switch (type){
            case 'bigquery':
                return {
                    credentials_json: JSON.parse(getValue(config,'credentials_json'))
                }
            case 'postgres':
                return parseArrayIntoConfig(config)
            default:
                return null;
        }
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
                                                {selectedSource.data_catalog_item_id === 'bigquery' ?
                                                    (
                                                        <div className={'flex flex-col w-full'}>
                                                            <span className={'text-lg capitalize font-semibold'}>
                                                                Credentials JSON :
                                                            </span>
                                                            <span className={'text-md font-normal'}>
                                                                Check out the <a className={'text-kuwala-green'} target={"_blank"} href={"https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-gcloud"}>docs</a> for more information on how to obtain this file.
                                                            </span>
                                                            <div
                                                                className={`
                                                                    w-full px-4 py-2 border-2 
                                                                    border-kuwala-green text-gray-800 
                                                                    rounded-lg mt-4
                                                                    overflow-y-auto
                                                                    flex flex-col
                                                                `}
                                                                style={{maxHeight: 320, minHeight: 200}}
                                                            >
                                                                <Field
                                                                    name={`connection_parameters[${i}].value`}
                                                                    type={'textField'}
                                                                    className={` w-full focus:outline-none`}
                                                                    style={{maxHeight: 320, minHeight: conParams.value ? 280 : 40}}
                                                                    placeholder={"Copy-paste the content  of your crendential file here"}
                                                                    component={'textarea'}
                                                                    key={conParams.id}
                                                                />
                                                                <div className={`
                                                                    w-full
                                                                    whitespace-pre-line
                                                                    text-gray-400
                                                                    ${conParams.value ? 'hidden' : ''}
                                                                `}>
                                                                    <p>{`{`}</p>
                                                                    <p className={'ml-4'}>"type": "",</p>
                                                                    <p className={'ml-4'}>"project_id": "",</p>
                                                                    <p className={'ml-4'}>"private_key_id": "",</p>
                                                                    <p className={'ml-4'}>"private_key": "",</p>
                                                                    <p className={'ml-4'}>"client_email": "",</p>
                                                                    <p className={'ml-4'}>"client_id": "",</p>
                                                                    <p className={'ml-4'}>"auth_uri": "",</p>
                                                                    <p className={'ml-4'}>"token_uri": "",</p>
                                                                    <p className={'ml-4'}>"auth_provider_x509_cert_url": "",</p>
                                                                    <p className={'ml-4'}>"client_x509_cert_url": ""</p>
                                                                    <p>{`}`}</p>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    )
                                                    :
                                                    (
                                                        <>
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
                                                        </>
                                                    )
                                                }

                                            </div>
                                        )
                                    })}
                                    <div className={'flex flex-row justify-between'}>
                                        <div className={'flex flex-row align-middle items-center justify-center mt-6'}>
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
                                            className={'bg-kuwala-green rounded-md px-3 w-24 py-2 mt-6'}
                                            type={'submit'}
                                            disabled={isSaveLoading}
                                        >
                                            <span className={'text-white hover:text-stone-300 w-full'}>
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
        <div className={`flex flex-col h-screen antialiased text-gray-900`}>
            <main className={'flex flex-col h-full w-full bg-kuwala-bg-gray'}>
                <Header />
                <div className={'flex flex-row mt-12 px-20'}>
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
                <div className={'mt-6 space-x-8 overflow-y-auto mx-20'}>
                    <Formik
                        initialValues={{
                            connection_parameters: preProcessConnectionParameters(initialConnectionParameters)
                        }}
                        onSubmit={async (values)=>{
                            await saveConfiguration({
                                dataSourceId: selectedSource.id,
                                config: values.connection_parameters
                            })
                        }}
                        children={renderDataSourceConfigForm}
                    />
                </div>

                <div className={'flex px-20 mb-8'}>
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