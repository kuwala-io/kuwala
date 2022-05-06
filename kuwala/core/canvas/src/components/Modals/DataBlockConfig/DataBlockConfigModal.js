import React, {useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {getColumns, getSchema, getTablePreview} from "../../../api/DataSourceApi";

import "./node-config-modal.css"
import {generateParamsByDataSourceType, preCreateSchemaExplorer, getDataDictionary, populateSchema} from '../../../utils/SchemaUtils'
import {
    populateAPIResult,
    columnAddressSplitter,
    tableAddressSplitter,
} from "../../../utils/TableSelectorUtils";
import {createNewDataBlock, updateDataBlockEntity} from "../../../api/DataBlockApi";
import DataBlockDTO from "../../../data/dto/DataBlockDTO";
import SchemaExplorer from "../../SchemaExplorer";
import Explorer from "../../Explorer";
import {SELECTOR_DISPLAY, PREVIEW_DISPLAY} from "../../../constants/components";
import Modal from "../../Common/Modal";
import Button from "../../Common/Button";
import {DATA_BLOCK} from "../../../constants/nodeTypes";

export default ({isOpen}) => {
    const {
        selectAllColumnAddresses,
        updateDataBlock
    } = useStoreActions(actions => actions.canvas);
    const {toggleConfigModal} = useStoreActions(actions => actions.common);
    const {selectedElement, selectedAddressObj} = useStoreState(state => state.canvas);
    const {openConfigModal} = useStoreState(state => state.common);
    const [schemaList, setSchema] = useState([])
    const [isSchemaLoading, setIsSchemaLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [selectorDisplay, setSelectorDisplay] = useState(SELECTOR_DISPLAY);
    const [isNodeSaveLoading, setIsNodeSaveLoading] = useState(false);
    const [dataBlockName, setDataBlockName] = useState('-');
    const [tableDataPreview, setTableDataPreview] = useState({
        columns: [],
        rows: []
    });
    const [columnsPreview, setColumnsPreview] = useState({
        columns: [],
        rows: []
    });

    useEffect( ()=> {
        initNodeName()
        if(selectedElement && selectedElement.type === DATA_BLOCK && openConfigModal) {
            const block = selectedElement.data.dataBlock;
            const selectedAddress = block.selectedAddressString;
            if(!selectedAddress || typeof selectedAddress === 'undefined'){
                fetchSchema().then(null)
            }
        }
    }, [selectedElement])

    useEffect(() => {
        if(selectedElement && selectedElement.type === DATA_BLOCK) {
            if(openConfigModal){
                populateConfigByDataBlock().then(null)
            }
        }
    }, [openConfigModal])

    useEffect(()=>{
        if(selectorDisplay === PREVIEW_DISPLAY && selectedTable !== null){
            prePopulatePreviewExplorer().then(null)
        } else if (selectorDisplay === SELECTOR_DISPLAY && selectedTable !== null) {
            prePopulateSelectorExplorer().then(null)
        }
    }, [selectorDisplay])

    const upsertDataBlock = async () => {
        setIsNodeSaveLoading(true);
        if(selectedElement){
            if(selectedElement.data.dataBlock) {
                const block = selectedElement.data.dataBlock;
                const selectedSource = selectedElement.data.dataSource;
                const {schema, category, table} = columnAddressSplitter(selectedTable);
                const newSelectedColumns = getSelectedColumnsOfCurrentTable(block.dataBlockId);

                // Insert new data block
                if(!block.dataBlockEntityId) {
                    const insertPayload = {
                        data_source_id: selectedSource.id,
                        name: dataBlockName,
                        columns: newSelectedColumns,
                    }

                    switch (selectedSource.dataCatalogItemId) {
                        case("bigquery"):
                            insertPayload.dataset_name = category
                            insertPayload.table_name = table
                            break;
                        case("postgres"):
                        case("snowflake"):
                            insertPayload.schema_name = schema
                            insertPayload.table_name = table
                            break;
                        default:
                            return;
                    }

                    try {
                        const res = await createNewDataBlock(insertPayload);
                        if(res.status === 200) {
                            const dto = new DataBlockDTO({
                                tableName: insertPayload.table_name,
                                schemaName: insertPayload.schema_name || null,
                                dataSetName: insertPayload.dataset_name || null,
                                dataBlockId: block.dataBlockId,
                                dataBlockEntityId: res.data.id,
                                isConfigured: true,
                                dataSourceDTO: selectedSource,
                                dataSourceId: selectedSource.id,
                                columns: res.data.columns,
                                name: res.data.name,
                                dataCatalogType: selectedSource.dataCatalogItemId,
                                selectedAddressString: selectedTable,
                            });
                            updateDataBlock(dto);
                            toggleConfigModal();
                        } else {
                            alert('Failed to create a new data block')
                        }
                    } catch (e){
                        console.error(e);
                        alert('Failed to create a new data block')
                    }

                } else {
                    // Update block
                    const updatePayload = {
                        id: block.dataBlockEntityId,
                        name: dataBlockName,
                        columns: newSelectedColumns
                    }

                    switch (selectedSource.dataCatalogItemId) {
                        case("bigquery"):
                            updatePayload.dataset_name = category
                            updatePayload.table_name = table
                            break;
                        case("postgres"):
                        case("snowflake"):
                            updatePayload.schema_name = schema
                            updatePayload.table_name = table
                            break;
                        default:
                            return;
                    }

                    try {
                        const res = await updateDataBlockEntity(updatePayload);
                        if(res.status === 200) {
                            const dto = new DataBlockDTO({
                                tableName: updatePayload.table_name,
                                schemaName: updatePayload.schema_name || null,
                                dataSetName: updatePayload.dataset_name || null,
                                dataBlockId: block.dataBlockId,
                                dataBlockEntityId: res.data.id,
                                isConfigured: true,
                                dataSourceDTO: selectedSource,
                                dataSourceId: selectedSource.id,
                                columns: res.data.columns,
                                name: res.data.name,
                                dataCatalogType: selectedSource.dataCatalogItemId,
                                selectedAddressString: selectedTable,
                            });

                            updateDataBlock(dto);
                            toggleConfigModal();
                        } else {
                            alert('Failed to update data block')
                        }
                    } catch (e) {
                        console.error(e);
                        alert('Failed to update data block')
                    }
                }
            }
        }
        setIsNodeSaveLoading(false);
    }

    const getSelectedColumnsOfCurrentTable = (dataBlockId) => {
        const  {schema, table, category} = columnAddressSplitter(selectedTable)
        try {
            return selectedAddressObj[dataBlockId][schema][category][table]
        } catch (e) {
            return []
        }
    }

    const initNodeName = () => {
        if(selectedElement && selectedElement.type === DATA_BLOCK) {
            setDataBlockName(selectedElement.data.dataBlock.name)
        }else {
            setDataBlockName('');
        }
    }

    const populateConfigByDataBlock = async () => {
        if(selectedElement){
            if(selectedElement.data.dataBlock) {
                const block = selectedElement.data.dataBlock;
                const selectedAddress = block.selectedAddressString;
                if(!selectedAddress) return
                setSelectedTable(selectedAddress)
                setIsTableLoading(true)
                setIsSchemaLoading(true)
                const schemaRes = await getSchema(selectedElement.data.dataSource.id);
                if(schemaRes.status === 200) {
                    const populatedSchema = populateSchema(schemaRes.data, selectedElement.data.dataSource);
                    preCreateSchemaExplorer({
                        schemaList: populatedSchema,
                        addressString: selectedAddress,
                        setSchema: setSchema,
                    })
                }
                const params = generateParamsByDataSourceType(
                    selectedElement.data.dataSource.dataCatalogItemId,
                    selectedAddress
                );
                const res = await getColumns({
                    id: selectedElement.data.dataSource.id,
                    params
                });
                selectAllColumnAddresses({
                    bulkAddress: block.columns.map((el) => `${selectedAddress}@${el}`),
                    dataBlockId: block.dataBlockId
                })
                if (res.status === 200) {
                    await populateAPIResult({
                        res: res,
                        setColumnsPreview: setColumnsPreview,
                        addressString: selectedAddress,
                    });
                }
                setIsTableLoading(false)
                setIsSchemaLoading(false)
            }
        }
    }

    async function fetchSchema() {
        if(selectedElement) {
            setIsSchemaLoading(true)
            const res = await getSchema(selectedElement.data.dataSource.id);
            if(res.status === 200) {
                const populatedSchema = populateSchema(res.data, selectedElement.data.dataSource);
                setSchema(populatedSchema)
            }
        }
        setIsSchemaLoading(false)
    }

    const ConfigHeader = () => {
        if (!selectedElement) {
            return <></>
        } else {
            return (
                <div className={'flex flex-row px-6 py-2'}>
                    <div className={'flex flex-col items-center'}>
                        <div
                            className={'flex flex-col justify-center items-center bg-white rounded-xl drop-shadow-lg relative p-4 w-24 h-24'}
                        >
                            <img
                                src={selectedElement.data.dataSource.logo}
                                style={{height: 48, width: 48}}
                                draggable={false}
                            />
                            <span className={'mt-1 text-sm'}>{selectedElement.data.dataSource.name}</span>
                            <div
                                className={`
                                    absolute right-0 top-0 p-1 border rounded-full w-5 h-5 -mr-2 -mt-2
                                    ${selectedElement.data.dataSource.connected ? "bg-kuwala-green" : "bg-red-400"}
                            `}
                            />
                        </div>
                    </div>

                    <div className={'flex flex-col ml-6 space-y-2 bottom-0 justify-end mb-2'}>
                        <span className={'px-3 py-1 bg-kuwala-light-green text-kuwala-green font-semibold rounded-lg w-36'}>
                            Data block
                        </span>

                        <div className={'flex flex-row items-center'}>
                            <label className={'font-semibold'}>Name:</label>
                            <input
                                type="text"
                                value={`${dataBlockName}`}
                                onChange={(e) => {
                                    setDataBlockName(e.target.value)
                                }}
                                className={`
                                    form-control
                                    block
                                    w-full                                   
                                    ml-2
                                    px-2
                                    py-0.5
                                    text-base
                                    font-light
                                    text-gray-700
                                    bg-gray-100 bg-clip-padding
                                    border border-solid border-kuwala-green
                                    rounded-lg
                                    transition
                                    ease-in-out
                                    m-0
                                    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                                `}
                            />
                        </div>
                    </div>
                </div>
            )
        }
    }

    const ConfigBody = () => {
        if (!selectedElement) {
            return (
                <div>
                    Undefined data source, try to re open the node configuration.
                </div>
            )
        } else {
            return (
                <div className={'flex flex-col flex-auto px-6 pt-2 pb-4 h-full overflow-y-auto'}>
                    <div className={'flex flex-row bg-white border-2 border-kuwala-green rounded-t-lg h-full w-full'}>
                        <div className={'flex flex-col bg-white w-3/12 border border-kuwala-green h-full'}>
                            <SchemaExplorer
                                schemaExplorerType={selectorDisplay}
                                isSchemaLoading={isSchemaLoading}
                                schemaList={schemaList}
                                selectedTable={selectedTable}
                                setSchema={setSchema}
                                setSelectedTable={setSelectedTable}

                                setColumnsPreview={setColumnsPreview}
                                setTableDataPreview={setTableDataPreview}

                                setIsTableLoading={setIsTableLoading}

                                dataSource={selectedElement.data.dataSource}
                            />
                        </div>
                        <div className={'flex flex-col bg-white w-9/12 rounded-tr-lg'}>
                            <div className={'flex flex-col w-full h-full'}>
                                {renderDisplaySelector()}
                                <Explorer
                                    displayType={selectorDisplay}
                                    columnsPreview={columnsPreview}
                                    tableDataPreview={tableDataPreview}
                                    isTableLoading={isTableLoading}
                                    selectedTable={selectedTable}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }

    const renderDisplaySelector = () => {
        return <div className={'flex flex-row justify-center items-center p-8'}>
            <div className={'flex flex-row '}>
                <div
                    className={`
                          border-b-2 border-t-2 border-l-2 border-kuwala-green
                          flex
                          items-center
                          justify-center
                          block
                          text-xs
                          leading-tight
                          rounded-l-lg
                          w-24
                          py-2
                          focus:outline-none focus:ring-0
                          cursor-pointer
                          font-bold
                          ${selectorDisplay === SELECTOR_DISPLAY ? 'bg-kuwala-green text-white' : 'bg-white text-kuwala-green'}
                      `}
                    onClick={()=>{
                        setSelectorDisplay(SELECTOR_DISPLAY)
                    }}
                    draggable={false}>
                    Selection
                </div>
                <div
                    className={`
                                  border-b-2 border-t-2 border-r-2 border-kuwala-green
                                  flex
                                  items-center
                                  justify-center
                                  block
                                  text-xs
                                  leading-tight
                                  rounded-r-lg
                                  w-24
                                  py-2
                                  focus:outline-none focus:ring-0
                                  cursor-pointer
                                  font-bold
                              ${selectorDisplay === PREVIEW_DISPLAY ? 'bg-kuwala-green text-white' : 'bg-white text-kuwala-green'}
                          `}
                    onClick={()=>{
                        setSelectorDisplay(PREVIEW_DISPLAY)
                    }}
                    draggable={false}>
                    Preview
                </div>
            </div>
        </div>
    }

    const prePopulatePreviewExplorer = async () => {
        setIsTableLoading(true)
        const params = generateParamsByDataSourceType(selectedElement.data.dataSource.dataCatalogItemId, selectedTable)
        try {
            const {schema, table, category} = tableAddressSplitter(selectedTable);
            // Set selected address
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
                id: selectedElement.data.dataSource.id,
                params: params
            })

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

        } catch(e) {
            console.error('Failed to pre populate preview explorer', e)
        }
        setIsTableLoading(false)
    }

    const prePopulateSelectorExplorer = async () => {
        setIsTableLoading(true)
        const selectedAddress = selectedTable;
        const res = await getColumns({
            id: selectedElement.data.dataSource.id,
            params: generateParamsByDataSourceType(
                selectedElement.data.dataSource.dataCatalogItemId,
                selectedAddress
            ),
        });
        if (res.status === 200) {
            await populateAPIResult({
                res: res,
                setColumnsPreview: setColumnsPreview,
                addressString: selectedAddress,
            });
        }
        setIsTableLoading(false)
    }

    const toggleConfigModalWrapper = () => {
        toggleConfigModal();
        setSelectedTable(null);
        setSelectorDisplay(SELECTOR_DISPLAY);
    }

    const ConfigFooter = () => {
        return (
            <div className={'flex flex-row justify-between px-6 pb-4'}>
                <Button
                    onClick={toggleConfigModalWrapper}
                    text={'Back'}
                />
                <Button
                    onClick={async () => {
                        await upsertDataBlock()
                    }}
                    loading={isNodeSaveLoading}
                    text={'Save'}
                />
            </div>
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            closeModalAction={toggleConfigModalWrapper}
        >
            {selectedElement && selectedElement.type === DATA_BLOCK ? (
                <>
                    <ConfigHeader/>
                    <ConfigBody/>
                    <ConfigFooter/>
                </>
            ) : <></>}
        </Modal>
    )
}