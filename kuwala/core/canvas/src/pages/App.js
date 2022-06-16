import React, {useRef, useCallback, useEffect, useState} from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {useStoreActions, useStoreState} from 'easy-peasy';
import {Link, useLocation} from "react-router-dom";
import DataBlockConfigModal from "../components/Modals/DataBlockConfig/DataBlockConfigModal";
import BlockCatalogModal from "../components/Modals/BlockCatalog/BlockCatalogModal";
import loadIcons from "../utils/IconsLoader";
import TransformationBlockConfigModal from "../components/Modals/TransformationBlockConfig/TransformationBlockConfigModal";
import Canvas from "../components/Canvas";
import {getAllExistingBlocks} from "../api/BlockApi";
import {getDataSourceDTOById} from "../utils/DataSourceUtils";
import {DATA_BLOCK, TRANSFORMATION_BLOCK, EXPORT_BLOCK} from "../constants/nodeTypes";
import {updateDataBlockEntity} from "../api/DataBlockApi";
import {updateTransformationBlockEntity} from "../api/TransformationBlock";
import {fromAPIResponseToDTO} from "../utils/DataBlockUtils";
import {fromAPIResponseToTransformationBlockDTO} from "../utils/TransformationBlockUtils";
import {getAllItemsInCategory, getAllTransformationCatalogCategories} from "../api/TransformationCatalog";
import {
    convertTransformationCatalogResponseToDTO,
    getTransformationCatalogById
} from "../utils/TransformationCatalogUtils";
import {getSchema} from "../api/DataSourceApi";
import Spinner from "../components/Common/Spinner";
import {ConfirmationDialog} from "../components/Common";
import ExportBlockConfigModal from "../components/Modals/ExportBlockConfig/ExportBlockConfigModal";
import {getAllExportCatalogCategories, getAllItemsInExportCategory} from "../api/ExportCatalog";
import {convertExportCatalogResponseToDTO, getExportCatalogById} from "../utils/ExportCatalogUtils";
import {fromAPIResponseToExportBlockDTO} from "../utils/ExportBlockUtils";
import {updateExportBlockEntity} from "../api/ExportBlock";


const App = () => {
    const reactFlowWrapper = useRef(null);
    const location = useLocation();
    const { elements, openDataView, selectedElement } = useStoreState(({ canvas }) => canvas);
    const {
        connectionLoaded,
        existingBlockLoaded,
        openConfigModal,
        openBlockCatalogModal,
        openTransformationConfigModal,
        openExportConfigModal
    } = useStoreState(({ common }) => common);
    const { dataSources } = useStoreState(({ dataSources }) => dataSources);
    const { transformationBlocks } = useStoreState(({ transformationBlocks }) => transformationBlocks);
    const { exportBlocks } = useStoreState(({ exportBlocks }) => exportBlocks);
    const {
        confirmText,
        dismissText,
        isOpen,
        loading,
        message,
        onConfirm,
        onDismiss,
        refreshBlocks,
        title
    } = useStoreState(({ confirmationDialog }) => confirmationDialog);
    const {
        addNode,
        connectNodes,
        loadConnections,
        removeNodes,
        setElements,
        setOpenDataView,
        setSelectedElement,
        updateElementById,
    } = useStoreActions(({ canvas }) => canvas);
    const { setRefreshBlocks } = useStoreActions(({ confirmationDialog }) => confirmationDialog);
    const {
        convertDataBlocksIntoElements,
        removeDataBlock,
        setDataBlocks,
        updateDataBlock,
        updateDataBlockPosition
    } = useStoreActions(({ dataBlocks }) => dataBlocks);
    const { getDataSources } = useStoreActions(({ dataSources }) => dataSources);
    const {
        convertTransformationBlockIntoElement,
        removeTransformationBlock,
        setTransformationBlocks,
        updateTransformationBlock,
        updateTransformationBlockPosition
    } = useStoreActions(({ transformationBlocks }) => transformationBlocks);
    const {
        convertExportBlockIntoElement,
        setExportBlocks,
        removeExportBlock,
        updateExportBlock,
        updateExportBlockPosition
    } = useStoreActions(({ exportBlocks }) => exportBlocks);
    const {
        setConnectionLoaded,
        setExistingBlockLoaded,
        setReactFlowInstance
    } = useStoreActions(({ common }) => common);
    const [loadingBlocks, setLoadingBlocks] = useState(false);
    const loadDataBlocks = useCallback(async (rawDataBlocks, loadedSources) => {
        const dtoList = []

        for (const raw of rawDataBlocks) {
            const dataSource = getDataSourceDTOById({ dataSources: loadedSources, id: raw.data_source_id });

            let schemaResponse = {};

            if (dataSource.dataCatalogItemId !== 'bigquery') {
                schemaResponse = await getSchema(dataSource.id);
            }

            const dto = fromAPIResponseToDTO(
                {
                    dataSource,
                    dataBlockResponse: raw,
                    schema: schemaResponse.data
                }
            )

            dtoList.push(dto)
        }

        setDataBlocks(dtoList);
        convertDataBlocksIntoElements({ addNode, elements, setElements });
    }, [addNode, convertDataBlocksIntoElements, elements, setDataBlocks, setElements]);
    const loadTransformationBlocks = useCallback(async (rawTransformationBlocks) => {
        const categories = await getAllTransformationCatalogCategories();
        let listOfCatalogItems = [];

        for (const cat of categories.data) {
            const catalogItems = await getAllItemsInCategory(cat.id);
            listOfCatalogItems.push(...catalogItems.data);
        }

        const dtoList = rawTransformationBlocks.map((el) => fromAPIResponseToTransformationBlockDTO({
            transformationCatalogItem: convertTransformationCatalogResponseToDTO(
                getTransformationCatalogById({
                    transformationCatalog: listOfCatalogItems,
                    id: el.transformation_catalog_item_id,
                })
            ),
            transformationBlockResponse: el
        }));

        setTransformationBlocks(dtoList);
        convertTransformationBlockIntoElement({ addNode, elements, setElements });
    }, [addNode, convertTransformationBlockIntoElement, elements, setElements, setTransformationBlocks]);
    const loadExportBlocks = useCallback(async (rawExportBlocks) => {
        const categories = await getAllExportCatalogCategories();
        let listOfCatalogItems = [];

        for (const cat of categories.data) {
            const catalogItems = await getAllItemsInExportCategory(cat.id);
            listOfCatalogItems.push(...catalogItems.data);
        }

        const dtoList = rawExportBlocks.map((el) => fromAPIResponseToExportBlockDTO({
            exportCatalogItem: convertExportCatalogResponseToDTO(
                getExportCatalogById({
                    exportCatalog: listOfCatalogItems,
                    id: el.export_catalog_item_id,
                })
            ),
            exportBlockResponse: el
        }));

        setExportBlocks(dtoList);
        convertExportBlockIntoElement({ addNode, elements, setElements });
    }, [addNode, convertExportBlockIntoElement, elements, setElements, setExportBlocks]);

    const loadExistingBlocks = useCallback(async () => {
        if (dataSources.length > 0) {
            const res = await getAllExistingBlocks();
            const { data, status } = res;

            if (status === 200 && data) {
                const { data_blocks, transformation_blocks, export_blocks } = data;

                await loadDataBlocks(data_blocks, dataSources);
                await loadTransformationBlocks(transformation_blocks);
                await loadExportBlocks(export_blocks);

                setExistingBlockLoaded(true);
            }
        }
    }, [dataSources, loadDataBlocks, loadTransformationBlocks, setExistingBlockLoaded]);
    const startLoadingExistingBlocks = useCallback(() => {
        setLoadingBlocks(true);

        loadExistingBlocks().then(() => {
            setLoadingBlocks(false);
        });
    }, [loadExistingBlocks, setLoadingBlocks]);

    useEffect(() => {
        if (refreshBlocks) {
            setRefreshBlocks(false);
            setElements([]);
            setExistingBlockLoaded(false);
            setConnectionLoaded(false);
        }
    }, [
        refreshBlocks,
        setConnectionLoaded,
        setElements,
        setExistingBlockLoaded,
        setRefreshBlocks,
        startLoadingExistingBlocks
    ]);

    useEffect(() => {
        if (location.state && location.state.reload) {
            location.state.reload = false;

            startLoadingExistingBlocks();
        }
    }, [location.state, startLoadingExistingBlocks]);

    useEffect(() => {
        loadIcons();
        getDataSources();
    }, [getDataSources]);

    useEffect( () => {
        if (dataSources.length > 0 && !existingBlockLoaded && !loadingBlocks) {
            startLoadingExistingBlocks();
        }
    }, [dataSources, existingBlockLoaded, loadingBlocks, startLoadingExistingBlocks]);

    useEffect(() => {
        if (!connectionLoaded && existingBlockLoaded) {
            loadConnections({ transformationBlocks, exportBlocks, updateDataBlock, updateTransformationBlock, updateExportBlock });
            setConnectionLoaded(true);
        }
    }, [
        connectionLoaded,
        existingBlockLoaded,
        loadConnections,
        setConnectionLoaded,
        transformationBlocks,
        updateDataBlock,
        updateTransformationBlock,
        exportBlocks
    ]);

    const onConnect = (params) => connectNodes({ params, updateDataBlock, updateTransformationBlock, updateExportBlock });
    const onElementsRemove = (elementsToRemove) => removeNodes({
        nodesToRemove: elementsToRemove,
        removeDataBlock,
        removeTransformationBlock,
        removeExportBlock,
        updateDataBlock,
        updateTransformationBlock,
        updateExportBlock
    });
    const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);
    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };
    const updateEntityPosition = (element) => {
        if (element.type === DATA_BLOCK && element.data.dataBlock.isConfigured) {
            updateDataBlockEntity(
                element.data.dataBlock.dataBlockEntityId,
                {
                    position_y: element.position.y,
                    position_x: element.position.x,
                }
            ).then((res) => {
                if (res.status === 200) {
                    const { id, position_x, position_y } = res.data;

                    updateDataBlockPosition({ dataBlockId: id, positionX: position_x, positionY: position_y });
                }
            })
        } else if(element.type === TRANSFORMATION_BLOCK && element.data.transformationBlock.isConfigured) {
            updateTransformationBlockEntity({
                transformationBlockId: element.data.transformationBlock.transformationBlockEntityId,
                data: {
                    position_y: element.position.y,
                    position_x: element.position.x,
                }
            }).then((res) => {
                if (res.status === 200) {
                    const { id, position_x, position_y } = res.data;

                    updateTransformationBlockPosition({
                        transformationBlockId: id,
                        positionX: position_x,
                        positionY: position_y
                    });
                }
            });
        } else if (element.type === EXPORT_BLOCK && element.data.exportBlock.isConfigured) {
            updateExportBlockEntity({
                exportBlockEntityId: element.data.exportBlock.exportBlockEntityId,
                data: {
                    position_y: element.position.y,
                    position_x: element.position.x,
                }
            }).then((res) => {
                if (res.status === 200) {
                    const { id, position_x, position_y } = res.data;

                    updateExportBlockPosition({
                        transformationBlockId: id,
                        positionX: position_x,
                        positionY: position_y
                    });
                }
            })
        }

        updateElementById(element);
    }

    const onNodeDragStop = (event, node) => {
        updateEntityPosition(node);
    }

    const renderFlow = () => {
        if (loadingBlocks) {
            return (
                <div className={'flex flex-col items-center justify-center bg-kuwala-bg-gray w-full h-full text-kuwala-green'}>
                    <Spinner size={'xl'}/>
                </div>
            )
        }

        if (dataSources.length > 0) {
            return (
                <Canvas
                    elements={elements}
                    onConnect={onConnect}
                    onDragOver={onDragOver}
                    onElementsRemove={onElementsRemove}
                    onNodeDragStop={onNodeDragStop}
                    onLoad={onLoad}
                    openDataView={openDataView}
                    reactFlowWrapper={reactFlowWrapper}
                    setOpenDataView={setOpenDataView}
                    setSelectedElement={setSelectedElement}
                />
            );
        } else {
            return (
                <div className={'flex flex-col items-center justify-center bg-kuwala-bg-gray w-full h-full'}>
                    <span className={'indent-2 text-xl'}>
                        To work with data on the canvas,
                    </span>
                    <span className={'indent-2 text-xl'}>
                        click on <Link to={'/data-catalog'}  className={'text-kuwala-green '}>Add data source</Link>
                    </span>
                </div>
            )
        }
    }

    return (
        <div className={`flex flex-col h-screen overflow-y-hidden antialiased text-gray-900 bg-white`}>
            <div className='flex flex-col h-full w-full'>
                <Header />

                <div className={'flex flex-row h-full w-full max-h-screen relative'}>
                    <Sidebar reactFlowWrapper={reactFlowWrapper} />

                    {renderFlow()}
                </div>

                <DataBlockConfigModal
                    isOpen={openConfigModal}
                    configData={selectedElement}
                />
                <BlockCatalogModal
                    isOpen={openBlockCatalogModal}
                />

                <TransformationBlockConfigModal
                    isOpen={openTransformationConfigModal}
                />

                <ExportBlockConfigModal
                    isOpen={openExportConfigModal}
                />

                <ConfirmationDialog
                    confirmText={confirmText}
                    dismissText={dismissText}
                    isOpen={isOpen}
                    loading={loading}
                    message={message}
                    onConfirm={onConfirm}
                    onDismiss={onDismiss}
                    title={title}
                />
            </div>
        </div>
    )
}

export default App;
