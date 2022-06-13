import React, {Fragment, useEffect, useState} from "react";
import Header from "../../components/Header";
import {useNavigate, Link} from "react-router-dom";
import {useStoreActions, useStoreState} from "easy-peasy";
import AddSVG from '../../icons/add_sources_green.png';
import {v4} from "uuid";
import DataBlockDTO from "../../data/dto/DataBlockDTO";
import styles from './styles';
import Button from "../../components/Common/Button";
import Spinner from "../../components/Common/Spinner";
import {Tag} from "../../components/Common";
import {DATA_BLOCK} from "../../constants/nodeTypes";
import {getLabelByDataCatalogId} from "../../utils/DataBlockUtils";


const DataPipelineManagement = () => {
    const navigate = useNavigate();
    const { reactFlowInstance } = useStoreState(({ common }) => common);
    const {
        dataSources,
        fetchedDataSources,
        loadingDataSources
    } = useStoreState(({ dataSources }) => dataSources);
    const { addNode } = useStoreActions(({ canvas }) => canvas);
    const { addDataSourceToCanvas, getDataSources } = useStoreActions(({ dataSources }) => dataSources);
    const { addDataBlock } = useStoreActions(({ dataBlocks }) => dataBlocks);
    const [ addingToCanvas, setAddingToCanvas ] = useState(false);

    useEffect(() => {
        if (!fetchedDataSources) {
            getDataSources();
        }
    }, [fetchedDataSources, getDataSources]);

    const addToCanvas = async (selectedSource) => {
        if (!selectedSource) return

        setAddingToCanvas(true);

        const dataBlock = new DataBlockDTO({
            tableName: null,
            schemaName: null,
            dataBlockId: v4(),
            dataBlockEntityId: null,
            isConfigured: false,
            dataSourceDTO: selectedSource,
            dataSourceId: selectedSource.id,
            columns: [],
            name: `${selectedSource.dataCatalogItemId}`,
            dataCatalogType: selectedSource.dataCatalogItemId,
            dataSetName: null,
            selectedAddressString: null,
            positionX: 200,
            positionY: 400
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
        }

        addDataBlock(dataBlock);
        addNode(node);
        setAddingToCanvas(false);
        navigate('/');
    }

    const goToDataSourceConfiguration = (dataSource) => {
        navigate('/data-source-config', { state: { dataSourceDTO: dataSource }});
    }

    const goToDataSourcePreview = (dataSource) => {
        navigate('/data-source-preview', { state: { dataSourceDTO: dataSource }});
    }

    const renderDataSourceName = (dataSource) => {
        return (
            <td className={styles.tableRowCell}>
                <div className={styles.dataSourceNameContainer}>
                    <img
                        className={styles.dataSourceLogo}
                        alt={"Data source logo"}
                        src={dataSource.logo}
                    />

                    <div className={styles.dataSourceName}>
                        {dataSource.name}
                    </div>
                </div>
            </td>
        );
    }

    const renderDataSourceStatus = (dataSource) => {
        return (
            <td className={styles.tableRowCell}>
                <div className={styles.statusContainer}>
                    <Tag
                        color={dataSource.connected ? 'green' : 'red'}
                        text={dataSource.connected ? 'Active' : 'Inactive'}
                    />
                </div>
            </td>
        );
    }

    const renderDataSourceButtons = (dataSource) => {
        return (
            <td className={styles.tableRowCell}>
                <div className={styles.dataSourceButtonsContainer}>
                    <Button
                        text={'Configure'}
                        solid={false}
                        onClick={() => goToDataSourceConfiguration(dataSource)}
                    />
                    {dataSource.connected &&
                        <Button
                            text={'Preview Data'}
                            solid={false}
                            onClick={() => goToDataSourcePreview(dataSource)}
                        />
                    }
                    {dataSource.connected &&
                        <Button
                            text={'Add to canvas'}
                            loading={addingToCanvas}
                            disabled={addingToCanvas}
                            onClick={async () => {
                                addDataSourceToCanvas(dataSource)
                                await addToCanvas(dataSource)
                            }}
                        />
                    }
                </div>
            </td>
        );
    }

    const renderDataSource = (dataSource, index) => {
        return (
            <tr
                key={index}
                className={`${styles.tableRow}${index < dataSources.length - 1 ? ' border-b-2' : ''}`}
            >
                {renderDataSourceName(dataSource)}
                {renderDataSourceStatus(dataSource)}
                {renderDataSourceButtons(dataSource)}
            </tr>
        )
    }

    const renderPipelineManager = () => {
        return !!dataSources.length && (
            <div className={styles.dataSourcesContainer}>
                <table className={styles.dataSourcesTable}>
                    <thead>
                        <tr className={styles.tableHeader}>
                            <th className={styles.tableHeaderColumn}>Name</th>
                            <th className={`${styles.tableHeaderColumn} justify-center`}>Status</th>
                            <th className={styles.tableHeaderColumn}/>
                        </tr>
                    </thead>

                    <tbody className={`flex flex-col`}>
                        {dataSources.map(renderDataSource)}
                    </tbody>
                </table>
            </div>
        )
    }

    const renderNewDataSourceButton = () => {
        return (
            <div className={styles.addDataSourceButtonContainer}>
                <Link to={'/data-catalog'} className={styles.addDataSourceButton}>
                    <img
                        className={styles.addDataSourceButtonIcon}
                        alt={"Add button"}
                        src={AddSVG}
                    />

                    <div className={styles.addDataSourceButtonText}>
                        Add a new data source
                    </div>
                </Link>
            </div>
        )
    }

    const renderBodyContent = () => {
        if (loadingDataSources) {
            return (
                <div className={styles.spinnerContainer}>
                    <Spinner size={'xl'}/>
                </div>
            )
        }

        return (
            <Fragment>
                {renderPipelineManager()}
                {renderNewDataSourceButton()}
            </Fragment>
        )
    }

    const renderFooter = () => {
        return (
            <div className={styles.footerContainer}>
                <Button
                    text={'Go to canvas'}
                    onClick={() => navigate('/')}
                />
            </div>
        );
    }

    const renderHeading = () => {
        return (
            <div className={styles.headerContainer}>
                <div className={styles.title}>
                    Data Pipeline Management
                </div>

                <div className={styles.subtitle}>
                    Configure and manage your selected data sources
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <Header />

            <main className={styles.bodyContainer}>
                <div className={styles.bodyContentContainer}>
                    {renderHeading()}
                    {renderBodyContent()}
                </div>

                {renderFooter()}
            </main>
        </div>
    )
};

export default DataPipelineManagement;
