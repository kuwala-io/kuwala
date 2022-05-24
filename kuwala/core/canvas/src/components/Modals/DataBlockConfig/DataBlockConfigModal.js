import React, {useCallback, useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {getColumns, getSchema} from "../../../api/DataSourceApi";
import "./node-config-modal.css"
import {generateParamsByDataSourceType, preCreateSchemaExplorer, populateSchema} from '../../../utils/SchemaUtils'
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
import { mapTablePreview } from "../../SchemaExplorer";


const DataBlockConfigModal = ({isOpen}) => {
    const { addNode, setElements } = useStoreActions(({ canvas }) => canvas);
    const {toggleConfigModal} = useStoreActions(({ common }) => common);
    const {
        selectAllColumnAddresses,
        updateDataBlock
    } = useStoreActions(({ dataBlocks }) => dataBlocks);
    const { elements, selectedElement } = useStoreState(({ canvas }) => canvas);
    const { openConfigModal } = useStoreState(({ common }) => common);
    const { selectedAddressObj } = useStoreState(({ dataBlocks }) => dataBlocks);
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
    const [populatedSelector, setPopulatedSelector] = useState(false);
    const fetchSchema = useCallback(async () => {
        if (selectedElement) {
            setIsSchemaLoading(true);

            const res = await getSchema(selectedElement.data.dataSource.id);

            if (res.status === 200) {
                const populatedSchema = populateSchema(res.data, selectedElement.data.dataSource);

                setSchema(populatedSchema)
            }

            setIsSchemaLoading(false)
        }
    }, [selectedElement])
    const populateConfigByDataBlock = useCallback(async () => {
        if (selectedElement) {
            if (selectedElement.data.dataBlock) {
                const block = selectedElement.data.dataBlock;
                const selectedAddress = block.selectedAddressString;

                if (!selectedAddress) return

                setSelectedTable(selectedAddress)
                setIsTableLoading(true)
                setIsSchemaLoading(true)

                const schemaRes = await getSchema(selectedElement.data.dataSource.id);

                if (schemaRes.status === 200) {
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
    }, [selectedElement, selectAllColumnAddresses]);
    const prePopulatePreviewExplorer = useCallback(async () => {
        setIsTableLoading(true);

        const params = generateParamsByDataSourceType(selectedElement.data.dataSource.dataCatalogItemId, selectedTable)
        const {schema, table, category} = tableAddressSplitter(selectedTable);
        const dataPreview = await mapTablePreview({
            category,
            dataSourceId: selectedElement.data.dataSource.id,
            params,
            schema,
            selectedAddressObj,
            selectedElement,
            table
        });
        setTableDataPreview(dataPreview);
        setIsTableLoading(false);
    }, [selectedAddressObj, selectedElement, selectedTable]);
    const prePopulateSelectorExplorer = useCallback(async () => {
        setIsTableLoading(true);

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
    }, [selectedElement, selectedTable]);

    useEffect( () => {
        if (selectedElement && selectedElement.type === DATA_BLOCK && openConfigModal) {
            const block = selectedElement.data.dataBlock;
            const selectedAddress = block.selectedAddressString;

            if (!selectedAddress || typeof selectedAddress === 'undefined'){
                fetchSchema().then(populateConfigByDataBlock)
            } else {
                populateConfigByDataBlock().then();
            }
        }
    }, [fetchSchema, openConfigModal, populateConfigByDataBlock, selectedElement])

    useEffect(() => {
        if (selectedElement && selectedElement.type === DATA_BLOCK) {
            setDataBlockName(selectedElement.data.dataBlock.name)
        } else {
            setDataBlockName(undefined);
        }
    }, [selectedElement])

    useEffect(() => {
        if (selectorDisplay === PREVIEW_DISPLAY && selectedTable !== null){
            prePopulatePreviewExplorer().then(null)
        } else if (selectorDisplay === SELECTOR_DISPLAY && selectedTable !== null && !populatedSelector) {
            prePopulateSelectorExplorer().then(() => setPopulatedSelector(true));
        }
    }, [populatedSelector, prePopulatePreviewExplorer, prePopulateSelectorExplorer, selectorDisplay, selectedTable])

    const onNameChange = (event) => {
        setDataBlockName(event.target.value);
    }

    const upsertDataBlock = async () => {
        setIsNodeSaveLoading(true);

        if (selectedElement){
            if (selectedElement.data.dataBlock) {
                const block = selectedElement.data.dataBlock;
                const selectedSource = selectedElement.data.dataSource;
                const {schema, category, table} = columnAddressSplitter(selectedTable);
                const newSelectedColumns = getSelectedColumnsOfCurrentTable(block.dataBlockId);

                // Insert new data block
                if (!block.dataBlockEntityId) {
                    const insertPayload = {
                        data_source_id: selectedSource.id,
                        name: dataBlockName,
                        columns: newSelectedColumns,
                        position_x: selectedElement.position.x,
                        position_y: selectedElement.position.y,
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
                                positionX: res.data.position_x,
                                positionY: res.data.position_y,
                                dataCatalogType: selectedSource.dataCatalogItemId,
                                selectedAddressString: selectedTable,
                            });
                            updateDataBlock({ addNode, elements, setElements, updatedBlock: dto });
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
                        const res = await updateDataBlockEntity(block.dataBlockEntityId,updatePayload);

                        if (res.status === 200) {
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

                            updateDataBlock({ addNode, elements, setElements, updatedBlock: dto });
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
        const  {schema, table, category} = columnAddressSplitter(selectedTable);

        try {
            return selectedAddressObj[dataBlockId][schema][category][table]
        } catch (e) {
            return []
        }
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
                setSelectedTable={(selectedTable) => {
                    setSelectedTable(selectedTable);
                    setPopulatedSelector(false);
                }}
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
