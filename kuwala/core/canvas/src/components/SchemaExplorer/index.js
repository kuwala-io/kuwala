import React from "react";
import {prePopulate, tableAddressSplitter} from "../../utils/TableSelectorUtils";
import {getColumns} from "../../api/DataSourceApi";
import {SELECTOR_DISPLAY, PREVIEW_DISPLAY} from "../../constants/components";
import {getTablePreview} from "../../api/DataSourceApi";
import {getDataDictionary, generateParamsByDataSourceType, getDatabaseTitleValue} from "../../utils/SchemaUtils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faAngleRight,
    faFolderClosed,
    faList,
    faTable
} from "@fortawesome/free-solid-svg-icons";
import {useStoreState} from "easy-peasy";

export default (
    {
        schemaExplorerType,
        selectedTable,
        setSelectedTable,
        isSchemaLoading,
        schemaList,
        setSchema,
        setIsTableLoading,
        setColumnsPreview,
        setTableDataPreview,
        dataSource,
    }) => {
    const {selectedAddressObj, selectedElement} = useStoreState((state) => state.canvas)

    const tableColumnSelectorOnClick = async ({addressString}) => {
        setSelectedTable(addressString);
        setIsTableLoading(true);
        const params = generateParamsByDataSourceType(dataSource.dataCatalogItemId, addressString);
        try {
            const res = await getColumns({
                id: dataSource.id,
                params
            });
            if(res.status === 200) {
                setColumnsPreview({
                    columns: [],
                    rows: prePopulate(res.data, addressString),
                });
            }
        } catch (e) {
            console.error('Failed to populate by selected block', e)
        }
        setIsTableLoading(false);
    }

    const tablePreviewSelectorOnClick  = async ({addressString}) => {
        setSelectedTable(addressString)
        setIsTableLoading(true)
        const params = generateParamsByDataSourceType(dataSource.dataCatalogItemId, addressString)
        const {schema, table, category} = tableAddressSplitter(addressString);

        let selectedCols = []
        try {
            selectedCols = selectedAddressObj[selectedElement.data.dataBlock.dataBlockId][schema][category][table];
        } catch (e) {
            selectedCols = [];
            console.info('No selected columns')
        }

        if(typeof selectedCols === 'undefined') selectedCols = [];
        if(selectedCols.length > 0) {
            params.columns = selectedCols
        }

        const res = await getTablePreview({
            id: dataSource.id,
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
        setIsTableLoading(false)
    }

    const renderDataPreviewTree = () => {
        return (
            <>
                <div className={'bg-kuwala-green w-full pl-4 py-2 text-white font-semibold'}>
                    Database: {getDatabaseTitleValue(dataSource)}
                </div>
                <div className={'overflow-y-scroll overflow-x-auto h-full w-full'}>
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
                className={'flex flex-row items-center pl-4 pr-8 py-2 cursor-pointer w-full'}
                onClick={() => {
                    toggleTreeItem(schemaObject.schema)
                }}
            >
                <span className={'mr-4'}>
                    <FontAwesomeIcon
                        icon={schemaObject.isOpen ? faAngleDown : faAngleRight}
                        style={{minWidth: 16, height: 16}}
                    />
                </span>
                <span className={'mr-4'}>
                    <FontAwesomeIcon
                        icon={faList}
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
                        className={`cursor-pointer min-w-max`}
                    >
                        <div
                            className={'flex flex-row items-center pl-12 pr-8 py-2 bg-white w-full'}
                            onClick={() => {
                                toggleTreeItem(currentKey)
                            }}
                        >
                        <span className={'mr-4 cursor-pointer'}>
                            <FontAwesomeIcon
                                icon={el.isOpen ? faAngleDown : faAngleRight}
                                style={{minWidth: 16, height: 16}}
                            />
                        </span>
                            <span className={'mr-4'}>
                            <FontAwesomeIcon
                                icon={faFolderClosed}
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

    const getOnClickEventByType = ({addressString}) => {
        if(schemaExplorerType === SELECTOR_DISPLAY) {
            tableColumnSelectorOnClick({
                addressString: addressString,
            })
        }else {
            tablePreviewSelectorOnClick({
                addressString: addressString,
            })
        }
    }

    const generateCategoryTables = (tableName, parent) => {
        const tableKey = `${parent}@${tableName}`
        return (
            <div
                className={`
                    flex flex-row items-center pl-20 pr-8 py-2
                    cursor-pointer
                    min-w-max
                    ${tableKey === selectedTable ? `bg-kuwala-green text-white` : `bg-white text-black`}
                `}
                key={tableKey}
                onClick={()=>{
                    getOnClickEventByType({
                        addressString: tableKey
                    })
                }}
            >
                <span className={'mr-4'}>
                    <FontAwesomeIcon
                        icon={faTable}
                        style={{minWidth: 16, minHeight: 16}}
                    />
                </span>
                <span className={'font-semibold text-md w-full'}>
                    {tableName}
                </span>
            </div>
        )
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

    return (
        renderDataPreviewTree()
    )
}