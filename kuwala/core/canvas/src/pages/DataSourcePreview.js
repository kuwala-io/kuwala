import React, {useEffect, useMemo, useState} from "react";
import Header from "../components/Header";
import {useLocation, Link} from "react-router-dom";
import {useStoreState} from "easy-peasy";
import ReactTable from 'react-table-6';
import "react-table-6/react-table.css";
import "./styles/data-source-preview-table.style.css";

import ListSVG from "../icons/list.svg"
import ArrowRight from "../icons/arrow-right-solid.svg"
import ArrowDown from "../icons/arrow-down-solid.svg"
import FolderSVG from "../icons/folder-solid.svg"
import TableSVG from "../icons/table-solid.svg"
import {getSchema, getTablePreview} from "../api/DataSourceApi";

const Table = ({columns, data}) => {
    const memoizedCols = useMemo(()=> {
        return columns
    },[]);

    const memoizedRows = useMemo(()=> {
        return data
    },[]);

    return (
        <ReactTable
            data={memoizedRows}
            columns={memoizedCols}
            defaultPageSize={20}
            showPagination={false}
            showPaginationTop={false}
            showPaginationBottom={false}
            showPageSizeOptions={false}
            style={{
                height: "100%",
                overFlowX: 'hidden',
            }}
            className="-striped -highlight"
        />
    )
}

export default () => {
    const location = useLocation()
    const dataIndex = location.state.index
    const {dataSource} = useStoreState((state) => state.canvas);
    const selectedSource = dataSource.filter((el) => el.id === dataIndex)[0];
    const [schemaList, setSchema] = useState([])
    const [selectedTable, setSelectedTable] = useState(null)
    const [isTableDataPreviewLoading, setIsTableDataPreviewLoading] = useState(false)
    const [isSchemaLoading, setIsSchemaLoading] = useState(false)
    const [tableDataPreview, setTableDataPreview] = useState({
        columns: [],
        rows: []
    })

    useEffect( ()=> {
        fetchSchema().then(null)
    }, [])

    async function fetchSchema() {
        setIsSchemaLoading(true)
        const res = await getSchema(dataIndex);
        if(res.status === 200) {
            const populatedSchema = populateSchema(res.data);
            setSchema(populatedSchema)
        }
        setIsSchemaLoading(false)
    }

    const populateSchema = (rawSchema) => {
        switch (selectedSource.data_catalog_item_id) {
            case 'postgres':
                return rawSchema.map((schema) => {
                    return {
                        ...schema,
                        isOpen: false,
                        categories: schema.categories.map((category)=>{
                            return {
                                ...category,
                                isOpen: false
                            }
                        })
                    }
                })
            case 'bigquery':
                return rawSchema.map((schema) => {
                    return {
                        ...schema,
                        schema: schema.project,
                        isOpen: false,
                        categories: schema.datasets.map((data)=>{
                            return {
                                ...data,
                                category: data.dataset,
                                isOpen: false
                            }
                        })
                    }
                })
            default:
                return rawSchema
        }
    }

    const renderTableDataPreview = () => {
        return (
            <div className={'overflow-x-auto'}>
                <Table columns={tableDataPreview.columns} data={tableDataPreview.rows}/>
            </div>
        )
    }

    const tableSelectionOnlick = async (addressString) => {
        setSelectedTable(addressString)
        setIsTableDataPreviewLoading(true)
        const params = generateParamsByDataSourceType(selectedSource.data_catalog_item_id, addressString)
        const res = await getTablePreview({
            id: dataIndex,
            params
        });

        if(res.status === 200) {
            let cols = res.data.columns.map((el,i)=>{
                return {
                    Header: el,
                    accessor: el,
                }
            });

            cols = [{
                Header: "#",
                id: "row",
                filterable: false,
                width: 50,
                Cell: (row) => {
                    return <div>{row.index+1}</div>;
                }
            }, ...cols]

            setTableDataPreview({
                columns: cols,
                rows: getDataDictionary(res.data.rows, res.data.columns),
            });
        }
        setIsTableDataPreviewLoading(false)
    }

    const getDataDictionary = (data, headers) => {
        let dictionary = [];

        for (let i = 1; i < data.length; i++) {
            let object = {};
            for (let j = 0; j < data[i].length; j++) {
                object[headers[j]] = typeof data[i][j] === 'object' ? JSON.stringify(data[i][j]) : data[i][j];
            }
            dictionary.push(object);
        }

        console.log(dictionary);
        return dictionary;
    };

    const generateParamsByDataSourceType = (type, addressString) => {
        const arr = addressString.split('@')
        switch (type){
            case "postgres":
                return {
                    schema_name: arr[0],
                    table_name: arr[2],
                    limit_columns: 200,
                    limit_rows: 300,
                }
            case "bigquery":
                return {
                    project_name: arr[0],
                    dataset_name: arr[1],
                    table_name: arr[2],
                    limit_columns: 200,
                    limit_rows: 300,
                }
            default: return ""
        }
    }

    const renderDataPreviewHeader = () => {
        return (
            <>
                <div className={'bg-kuwala-green w-full pl-4 py-2 text-white font-semibold'}>
                    Database: Kuwala
                </div>
                <div className={'overflow-y-scroll overflow-x-auto h-full'}>
                    {isSchemaLoading
                        ?
                        <div className="flex flex-col w-full h-full justify-center items-center">
                            <div
                                className="spinner-border animate-spin inline-block w-16 h-16 border-4 text-kuwala-green rounded-full"
                                role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        :
                        schemaList.map(el => renderSchemaBlock(el))
                    }
                </div>
            </>
        )
    }

    const renderDataPreviewBody = () => {
        return (
            <>
                {selectedTable
                    ?
                    isTableDataPreviewLoading
                        ?
                        <div className="flex flex-col w-full h-full justify-center items-center">
                            <div
                                className="spinner-border animate-spin inline-block w-24 h-24 border-4 text-kuwala-green rounded-full"
                                role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        :
                        renderTableDataPreview()
                    :
                    <div className="flex flex-col w-full h-full text-xl font-light justify-center items-center">
                        <p>Select a table from the <span className={'text-kuwala-green'}>left</span></p>
                        <p>to preview the data</p>
                    </div>
                }
            </>
        )
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
                <div className={'flex flex-row bg-white border-2 border-kuwala-green rounded-lg h-full w-full'}>
                    <div className={'flex flex-col bg-white w-3/12 border border-kuwala-green'}>
                        {renderDataPreviewHeader()}
                    </div>
                    <div className={'flex flex-col bg-white w-9/12'}>
                        {renderDataPreviewBody()}
                    </div>
                </div>
            )
        }
    }

    const toggleTreeItem = (addressString) => {
        const arr = addressString.split('@')
        const schemaAddress = arr[0]
        const categoryAddress = arr[1]

        let tempSchema;
        if(categoryAddress && schemaAddress) {
            tempSchema = schemaList.map((el) => {
                if (el.schema === schemaAddress) {
                    return {
                        ...el,
                        categories: el.categories.map((cat) => {
                            if (cat.category === categoryAddress){
                                cat.isOpen = !cat.isOpen
                            }
                            return cat
                        })
                    }
                }
                return el
            })
        } else {
            tempSchema = schemaList.map((el) => {
                if (el.schema === schemaAddress){
                    el.isOpen = !el.isOpen
                    if (el.isOpen === false) {
                        return {
                            ...el,
                            categories: el.categories.map((cat) => {
                                cat.isOpen = false
                                return cat
                            })
                        }
                    }
                }
                return el
            })
        }
        setSchema(tempSchema)
    }

    const renderSchemaBlock = (schema) => {
        return (
            // PARENT CONTAINER
            <div className={'flex flex-col w-full bg-white'}>
                {/* SCHEMA */}
                {generateSchemaParent(schema)}
                {schema.isOpen ? generateCategories(schema.categories, schema.schema) : null}
            </div>
        )
    }

    const generateSchemaParent = (schemaObject) => {
        return (
            <div
                className={'flex flex-row items-center pl-4 py-2 cursor-pointer'}
                onClick={() => {
                    toggleTreeItem(schemaObject.schema)
                }}
            >
                <span className={'mr-4'}>
                    <img
                        src={schemaObject.isOpen ? ArrowDown : ArrowRight}
                        style={{minWidth: 16, height: 16}}
                    />
                </span>
                <span className={'mr-4'}>
                    <img
                        src={ListSVG}
                        style={{minWidth: 16, height: 16}}
                    />
                </span>
                <span className={'font-semibold text-md'}>
                    {schemaObject.schema}
                </span>
            </div>
        )
    }

    const generateCategories = (categories, parentSchema) => {
        return (
            categories.map((el, i) => {
                const currentKey = `${parentSchema}@${el.category}`
                return (
                    <div
                        key={currentKey}
                        className={`cursor-pointer`}
                    >
                        <div
                            className={'flex flex-row items-center pl-12 py-2 bg-white'}
                             onClick={() => {
                                 toggleTreeItem(currentKey)
                             }}
                        >
                        <span className={'mr-4 cursor-pointer'}>
                            <img
                                src={el.isOpen ? ArrowDown : ArrowRight}
                                style={{minWidth: 16, height: 16}}
                            />
                        </span>
                            <span className={'mr-4'}>
                            <img
                                src={FolderSVG}
                                style={{minWidth: 16, height: 16}}
                            />
                        </span>
                            <span className={'font-semibold text-md'}>
                            {el.category}
                        </span>
                        </div>
                        {el.isOpen ?
                            el.tables.map(el => generateCategoryTables(el, currentKey))
                            : null
                        }
                    </div>
                )
            })
        )
    }

    const generateCategoryTables = (tableName, parent) => {
        const tableKey = `${parent}@${tableName}`
        return (
            <div
                className={`
                    flex flex-row items-center pl-20 py-2
                    cursor-pointer
                    min-w-full
                    ${tableKey === selectedTable ? `bg-kuwala-green text-white` : `bg-white text-black`}
                `}
                key={tableKey}
                onClick={()=>{
                    tableSelectionOnlick(tableKey)
                }}
            >
                <span className={'mr-4'}>
                    <img
                        src={TableSVG}
                        style={{minWidth: 16, minHeight: 16}}
                    />
                </span>
                <span className={'font-semibold text-md'}>
                    {tableName}
                </span>
            </div>
        )
    }

    const renderSelectedSourceHeader = () => {
        if (!selectedSource) {
            return <></>
        } else {
            return (
                <div
                    className={'flex flex-col justify-center items-center bg-white rounded-xl drop-shadow-lg'}
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

                {/* Data Sources Container*/}
                <div className={'mt-6 space-x-8 overflow-x-hidden h-6/12 max-h-full px-20'}>
                    {renderDataPreview()}
                </div>

                <div className={'flex px-20 mb-8'}>
                    <Link
                        className={'bg-kuwala-green text-white rounded-md px-4 py-2 mt-4 mb-4 hover:text-stone-300'}
                        to={'/data-pipeline-management'}
                    >
                        Back
                    </Link>
                </div>
            </main>
        </div>
    )
}