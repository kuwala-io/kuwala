import React, {Fragment, useEffect, useMemo, useState} from "react";
import Header from "../../components/Header";
import {useLocation, useNavigate} from "react-router-dom";
import {useStoreActions, useStoreState} from "easy-peasy";
import { SchemaExplorer } from "../../components/SchemaExplorer";
import Explorer from "../../components/Explorer";
import {getSchema} from "../../api/DataSourceApi";
import {createNewDataBlock} from "../../api/DataBlockApi";
import DataSourceDTO from "../../data/dto/DataSourceDTO";
import DataBlocksDTO from "../../data/dto/DataBlockDTO";
import {populateSchema} from "../../utils/SchemaUtils";
import {PREVIEW_DISPLAY} from "../../constants/components";
import styles from "./styles";
import Button from "../../components/Common/Button";
import {DATA_BLOCK} from "../../constants/nodeTypes";
import {getLabelByDataCatalogId} from "../../utils/DataBlockUtils";

const DataSourcePreview = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const { addNode } = useStoreActions(({ canvas }) => canvas);
    const { addDataBlock } = useStoreActions(({ dataBlocks }) => dataBlocks);
    const { reactFlowInstance } = useStoreState(({ common }) => common);
    const { addDataSourceToCanvas} = useStoreActions(({ dataSources }) => dataSources);
    const [selectedTable, setSelectedTable] = useState(null)
    const [isTableDataPreviewLoading, setIsTableDataPreviewLoading] = useState(false)
    const [schemaList, setSchema] = useState([])
    const [schemaLoading, setSchemaLoading] = useState(false)
    const [addingToCanvas, setAddingToCanvas] = useState(false);
    const [tableDataPreview, setTableDataPreview] = useState({
        columns: [],
        rows: []
    })
    const selectedSource = useMemo(() => new DataSourceDTO({
        ...location.state.dataSourceDTO
    }), [location.state.dataSourceDTO]);

    useEffect( () => {
        fetchSchema(selectedSource).then(null)
    }, [selectedSource]);

    async function fetchSchema(selectedSource) {
        setSchemaLoading(true);

        const res = await getSchema(selectedSource.id);

        if (res.status === 200) {
            const populatedSchema = populateSchema(res.data, selectedSource);

            setSchema(populatedSchema);
        }

        setSchemaLoading(false);
    }

    const addToCanvas = async () => {
        if (!selectedSource) return

        setAddingToCanvas(true);

        const selectedAddress = selectedTable.split('@');
        const columnsArray = tableDataPreview.columns.slice(1).map((el) => `${el.Header}`);
        const payload = {
            data_source_id: selectedSource.id,
            name: `${selectedSource.dataCatalogItemId}_${selectedAddress[2]}`,
            columns: columnsArray,
            position_x: 200,
            position_y: 400
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

            if (res.status === 200) {
                const dataBlock = new DataBlocksDTO({
                    tableName: payload.table_name,
                    schemaName: payload.schema_name,
                    dataSetName: payload.dataset_name,
                    dataBlockId: res.data.id,
                    dataBlockEntityId: res.data.id,
                    isConfigured: true,
                    dataSourceDTO: selectedSource,
                    dataSourceId: selectedSource.id,
                    columns: res.data.columns,
                    name: payload.name,
                    dataCatalogType: selectedSource.dataCatalogItemId,
                    selectedAddressString: selectedTable,
                });
                const node = {
                    type: DATA_BLOCK,
                    data: {
                        label: getLabelByDataCatalogId(dataBlock.dataCatalogType),
                        dataSource: dataBlock.dataSourceDTO,
                        dataBlock
                    },
                    sourcePosition: 'right',
                    targetPosition: 'left',
                    position: reactFlowInstance.project({
                        x: dataBlock.positionX,
                        y: dataBlock.positionY
                    })
                };

                addDataSourceToCanvas(selectedSource);
                addDataBlock(dataBlock);
                addNode(node);
                navigate('/', { state: { reload: true } });
            } else {
                alert('Something went wrong when adding the data block');
                console.error(res.data)
            }
        } catch(e) {
            alert('Something went wrong when adding the data block');
            console.error(e);
        }

        setAddingToCanvas(false);
    }

    const renderDataPreview = () => {
        return (
            <div className={styles.dataPreviewContainer}>
                <div className={styles.schemaExplorerContainer}>
                    <SchemaExplorer
                        schemaExplorerType={PREVIEW_DISPLAY}
                        selectedTable={selectedTable}
                        setTableDataPreview={setTableDataPreview}
                        setSelectedTable={setSelectedTable}
                        setSchema={setSchema}
                        schemaLoading={schemaLoading}
                        schemaList={schemaList}
                        setIsTableLoading={setIsTableDataPreviewLoading}
                        dataSource={selectedSource}
                    />
                </div>

                <div className={styles.explorerContainer}>
                    <Explorer
                        selectedTable={selectedTable}
                        tableDataPreview={tableDataPreview}
                        isTableLoading={isTableDataPreviewLoading}
                    />
                </div>
            </div>
        )
    }

    const renderSelectedSourceHeader = () => {
        return (
            selectedSource &&
            <div className={styles.dataSourceContainer}>
                <img
                    className={styles.dataSourceLogo}
                    alt={'Data source logo'}
                    src={selectedSource.logo}
                />

                <div className={styles.dataSourceName}>
                    {selectedSource.name}
                </div>

                <div
                    className={`
                        ${styles.dataSourceConnectionStatus}
                        ${selectedSource.connected ? " bg-kuwala-green" : " bg-red-400"}
                    `}
                />
            </div>
        )
    }

    const renderHeader = () => {
        return (
            <Fragment>
                <Header/>

                <div className={styles.headerContainer}>
                    {renderSelectedSourceHeader()}

                    <div className={styles.titleContainer}>
                        <div className={styles.title}>
                            Data Pipeline Preview
                        </div>

                        <div className={styles.subtitle}>
                            Explore the data
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }

    const renderFooter = () => {
        return (
            <div className={styles.footerContainer}>
                <Button
                    text={'Back'}
                    onClick={() => {
                        navigate(-1);
                    }}
                />

                <Button
                    text={'Add to canvas'}
                    disabled={!selectedTable || isTableDataPreviewLoading || addingToCanvas}
                    loading={addingToCanvas}
                    onClick={async () => {
                        await addToCanvas();
                    }}
                />
            </div>
        );
    };

    return (
        <div className={styles.pageContainer}>
            <main className={styles.pageContentContainer}>
                {renderHeader()}
                {renderDataPreview()}
                {renderFooter()}
            </main>
        </div>
    )
}

export default DataSourcePreview;
