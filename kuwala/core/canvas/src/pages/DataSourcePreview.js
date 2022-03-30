import React, {useEffect, useState} from "react";
import Header from "../components/Header";
import {useLocation, Link, useNavigate} from "react-router-dom";
import {useStoreActions} from "easy-peasy";
import "react-table-6/react-table.css";
import "./styles/data-source-preview-table.style.css";

import SchemaExplorer from "../components/SchemaExplorer";
import Explorer from "../components/Explorer";

import {getSchema} from "../api/DataSourceApi";
import {createNewDataBlock} from "../api/DataBlockApi";
import {v4} from "uuid";
import DataSourceDTO from "../data/dto/DataSourceDTO";
import DataBlocksDTO from "../data/dto/DataBlockDTO";
import {populateSchema} from "../utils/SchemaUtils";
import {PREVIEW_DISPLAY} from "../constants/components";

export default () => {
    const navigate = useNavigate();
    const location = useLocation()
    const {addDataBlock, addDataSourceToCanvas} = useStoreActions((actions) => actions.canvas);
    const selectedSource = new DataSourceDTO({...location.state.dataSourceDTO})
    const [selectedTable, setSelectedTable] = useState(null)
    const [isTableDataPreviewLoading, setIsTableDataPreviewLoading] = useState(false)
    const [schemaList, setSchema] = useState([])
    const [isSchemaLoading, setIsSchemaLoading] = useState(false)
    const [isAddToCanvasLoading, setIsAddToCanvasLoading] = useState(false);
    const [tableDataPreview, setTableDataPreview] = useState({
        columns: [],
        rows: []
    })

    useEffect( ()=> {
        fetchSchema(selectedSource).then(null)
    }, [])

    async function fetchSchema(selectedSource) {
        setIsSchemaLoading(true)
        const res = await getSchema(selectedSource.id);
        if(res.status === 200) {
            const populatedSchema = populateSchema(res.data, selectedSource);
            setSchema(populatedSchema)
        }
        setIsSchemaLoading(false)
    }

    const addToCanvas = async () => {
        if(!selectedSource) return
        setIsAddToCanvasLoading(true);

        const selectedAddress = selectedTable.split('@');

        const columnsArray = tableDataPreview.columns.slice(1).map((el) => `${el.Header}`);
        const payload = {
            data_source_id: selectedSource.id,
            name: `${selectedSource.dataCatalogItemId}_${selectedAddress[2]}`,
            columns: columnsArray,
        }

        switch (selectedSource.dataCatalogItemId) {
            case("bigquery"):
                payload.dataset_name = selectedAddress[1]
                payload.table_name = selectedAddress[2]
                payload.schema_name = null;
                break;
            case("postgres"):
            case("snowflake"):
                payload.schema_name = selectedAddress[0]
                payload.table_name = selectedAddress[2]
                payload.dataset_name = null;
                break;
            default:
                return;
        }

        try {
            const res = await createNewDataBlock(payload);
            if(res.status === 200) {
                const dto = new DataBlocksDTO({
                    tableName: payload.table_name,
                    schemaName: payload.schema_name,
                    dataSetName: payload.dataset_name,
                    dataBlockId: v4(),
                    dataBlockEntityId: res.data.id,
                    isConfigured: true,
                    dataSourceDTO: selectedSource,
                    dataSourceId: selectedSource.id,
                    columns: res.data.columns,
                    name: payload.name,
                    dataCatalogType: selectedSource.dataCatalogItemId,
                    selectedAddressString: selectedTable,
                });
                addDataSourceToCanvas(selectedSource);
                addDataBlock(dto);
                navigate('/')
            } else {
                alert('Something went wrong when adding data block');
                console.error(res.data)
            }
        } catch(e){
            alert('Something went wrong when adding data block');
            console.error(e)
        }
        setIsAddToCanvasLoading(false);
    }

    const renderDataPreview = () => {
        if (!selectedSource) {
            return (
                <div>
                    Undefined data source, something is wrong.
                </div>
            )
        } else {
            return (
                <div className={'flex flex-row bg-white border-2 border-kuwala-green rounded-t-lg h-full w-full'}>
                    <div className={'flex flex-col bg-white w-3/12 border border-kuwala-green'}>
                        <SchemaExplorer
                            schemaExplorerType={PREVIEW_DISPLAY}
                            selectedTable={selectedTable}
                            setTableDataPreview={setTableDataPreview}
                            setSelectedTable={setSelectedTable}
                            setSchema={setSchema}
                            isSchemaLoading={isSchemaLoading}
                            schemaList={schemaList}
                            setIsTableLoading={setIsTableDataPreviewLoading}
                            dataSource={selectedSource}
                        />
                    </div>
                    <div className={'flex flex-col bg-white w-9/12 rounded-tr-lg'}>
                        <Explorer
                            selectedTable={selectedTable}
                            tableDataPreview={tableDataPreview}
                            isTableLoading={isTableDataPreviewLoading}
                            wrapperClasses={`flex flex-col overflow-x-auto`}
                        />
                    </div>
                </div>
            )
        }
    }

    const renderSelectedSourceHeader = () => {
        if (!selectedSource) {
            return <></>
        } else {
            return (
                <div
                    className={'flex flex-col justify-center items-center bg-white rounded-xl drop-shadow-lg relative'}
                    style={{width: 148, height: 148}}
                >
                    <img
                        src={selectedSource.logo}
                        style={{height: 72, width: 72}}
                    />
                    <span className={'mt-1'}>{selectedSource.name}</span>
                    <div
                        className={`
                            absolute right-0 top-0 p-1 border rounded-full w-7 h-7 -mr-2 -mt-2
                            ${selectedSource.connected ? "bg-kuwala-green" : "bg-red-400"}
                            `}
                    />
                </div>
            )
        }
    }

    return (
        <div className={`flex flex-col h-screen w-screen antialiased text-gray-900`}>
            <main className={'flex flex-col h-full w-full bg-kuwala-bg-gray'}>
                <Header/>
                <div className={'flex flex-row px-20 mt-12'}>
                    {renderSelectedSourceHeader()}
                    <div className={`flex flex-col ${selectedSource ? 'ml-12 justify-center' : ''}`}>
                    <span className={'font-semibold text-3xl'}>
                        Data Pipeline Preview
                    </span>
                        <span className={'font-light text-xl mt-3'}>
                        Explore the data
                    </span>
                    </div>
                </div>

                <div className={'mt-6 space-x-8 overflow-x-hidden h-6/12 max-h-full px-20'}>
                    {renderDataPreview()}
                </div>

                <div className={'flex flex-row justify-between items-center px-20 mb-8'}>
                    <Link
                        className={'bg-kuwala-green text-white rounded-md px-4 py-2 mt-4 mb-4 hover:text-stone-300'}
                        to={'/data-pipeline-management'}
                    >
                        Back
                    </Link>
                    <button
                        className={`
                                text-white rounded-md px-6 py-2 mt-4 mb-4 w-44 font-semibold
                                ${(selectedTable && (!isTableDataPreviewLoading && !isAddToCanvasLoading)) ? 'bg-kuwala-green hover:text-stone-300' : 'bg-red-200'}
                            `}
                        disabled={!(selectedTable && (!isTableDataPreviewLoading && !isAddToCanvasLoading))}
                        onClick={async ()=>{
                            await addToCanvas()
                        }}
                    >
                        {
                            isAddToCanvasLoading
                                ?
                                    (
                                        <div
                                            className="spinner-border animate-spin inline-block w-4 h-4 border-4 rounded-full"
                                            role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    )
                                :
                                    'Add to Canvas'
                        }
                    </button>
                </div>
            </main>
        </div>
    )
}