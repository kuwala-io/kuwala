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
import {SELECTOR_DISPLAY, PREVIEW_DISPLAY} from "../../../constants/components";
import Modal from "../../Common/Modal";
import {DATA_BLOCK} from "../../../constants/nodeTypes";
import DataBlockConfigBody from './DataBlockConfigBody';
import DataBlockConfigFooter from "./DataBlockConfigFooter";
import DataBlockConfigHeader from './DataBlockConfigHeader';


const DataBlockConfigModal = ({isOpen}) => {
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
    const [dataBlockName, setDataBlockName] = useState(undefined);
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

    const onNameChange = (event) => {
        setDataBlockName(event.target.value);
    }

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

    return (
        <Modal
            isOpen={isOpen}
            closeModalAction={toggleConfigModalWrapper}
        >
            <DataBlockConfigHeader
                selectedElement={selectedElement}
                dataBlockName={dataBlockName}
                onNameChange={onNameChange}
            />

            <DataBlockConfigBody
                columnsPreview={columnsPreview}
                isSchemaLoading={isSchemaLoading}
                isTableLoading={isTableLoading}
                schemaList={schemaList}
                selectedElement={selectedElement}
                selectedTable={selectedTable}
                selectorDisplay={selectorDisplay}
                setColumnsPreview={setColumnsPreview}
                setIsTableLoading={setIsTableLoading}
                setSchema={setSchema}
                setSelectedTable={setSelectedTable}
                setSelectorDisplay={setSelectorDisplay}
                setTableDataPreview={setTableDataPreview}
                tableDataPreview={tableDataPreview}
            />

            <DataBlockConfigFooter
                onClickBack={toggleConfigModalWrapper}
                onClickSave={async () => {
                    await upsertDataBlock()
                }}
                saveButtonLoading={isNodeSaveLoading}
                saveButtonDisabled={isNodeSaveLoading || !selectedTable}
            />
        </Modal>
    )
}

export default DataBlockConfigModal;
