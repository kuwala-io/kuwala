import React, {useRef, useEffect, useState} from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {useStoreActions, useStoreState} from 'easy-peasy';
import {Link} from "react-router-dom";
import DataBlockConfigModal from "../components/Modals/DataBlockConfig/DataBlockConfigModal";
import TransformationCatalogModal from "../components/Modals/TransformationCatalog/TransformationCatalogModal";
import loadIcons from "../utils/IconsLoader";
import TransformationBlockConfigModal from "../components/Modals/TransformationBlockConfig/TransformationBlockConfigModal";
import Canvas from "../components/Canvas";
import {getAllExistingBlocks} from "../api/BlockApi";
import {getDataSourceDTOById} from "../utils/DataSourceUtils";
import {DATA_BLOCK, TRANSFORMATION_BLOCK} from "../constants/nodeTypes";
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


const App = () => {
    const reactFlowWrapper = useRef(null);
    const {elements, selectedElement, dataSource, openDataView} = useStoreState(state => state.canvas);
    const {openConfigModal, openTransformationCatalogModal, openTransformationConfigModal, isConnectionLoaded, isExistingBlockLoaded} = useStoreState(state => state.common);
    const {
        setSelectedElement,
        removeNode,
        connectNodes,
        setOpenDataView,
        getDataSources,
        convertDataBlocksIntoElement,
        convertTransformationBlockIntoElement,
        setDataBlocks,
        updateDataBlock,
        setTransformationBlocks,
        updateTransformationBlock,
        loadConnections,
    } = useStoreActions(actions => actions.canvas);
    const {
        setReactFlowInstance,
        setConnectionLoaded,
        setExistingBlockLoaded
    } = useStoreActions(actions => actions.common);
    const [loadingBlocks, setLoadingBlocks] = useState(false);

    useEffect(async ()=> {
        loadIcons();
        getDataSources();
    }, [])

    useEffect(async () => {
        if (dataSource.length > 0) {
            if(!isExistingBlockLoaded) {
                setLoadingBlocks(true);
                await loadExistingBlocks();
                setExistingBlockLoaded(true);
                setLoadingBlocks(false);
            }
        }
    }, [dataSource]);

    useEffect(() => {
        if(!isConnectionLoaded && isExistingBlockLoaded) {
            loadConnections();
            setConnectionLoaded(true);
        }
    }, [isExistingBlockLoaded])

    const loadExistingBlocks = async () => {
        if (dataSource.length > 0) {
            const res = await getAllExistingBlocks();
            if(res.status === 200) {
                await loadDataBlocks(res.data.data_blocks, dataSource);
                await loadTransformationBlocks(res.data.transformation_blocks);
            }
        }
    }

    const loadDataBlocks = async (rawDataBlocks, loadedSource) => {
        const dtoList = []
        for (const raw of rawDataBlocks) {
            const dataSource= getDataSourceDTOById({dataSource: loadedSource, id: raw.data_source_id})
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
        convertDataBlocksIntoElement();
    }

    const loadTransformationBlocks = async (rawTransformationBlocks) => {
        const categories = await getAllTransformationCatalogCategories();
        let listOfCatalogItems = [];
        for (const cat of categories.data) {
            const catalogItems = await getAllItemsInCategory(cat.id);
            listOfCatalogItems.push(...catalogItems.data);
        }
        const dtoList = rawTransformationBlocks.map((el) => fromAPIResponseToTransformationBlockDTO({
            transformationCatalog: convertTransformationCatalogResponseToDTO(
                getTransformationCatalogById({
                    transformationCatalog: listOfCatalogItems,
                    id: el.transformation_catalog_item_id,
                })
            ),
            transformationBlockResponse: el
        }));
        setTransformationBlocks(dtoList);
        convertTransformationBlockIntoElement();
    }

    const onConnect = (params) => connectNodes(params);
    const onElementsRemove = (elementsToRemove) => removeNode(elementsToRemove)
    const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const updateEntityPosition = async (element) => {
        if(element.type === DATA_BLOCK && element.data.dataBlock.isConfigured) {
            updateDataBlockEntity(element.data.dataBlock.dataBlockEntityId, {
                position_y: element.position.y,
                position_x: element.position.x,
            }).then((res) => {
                if(res.status === 200) {
                    const updatedDTO = element.data.dataBlock;
                    updatedDTO.position_y = element.position.y;
                    updatedDTO.position_x = element.position.x;
                    updateDataBlock(updatedDTO);
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
                if(res.status === 200) {
                    const updatedDTO = element.data.transformationBlock;
                    updatedDTO.positionX = element.position.x;
                    updatedDTO.positionY = element.position.y;
                    updateTransformationBlock(updatedDTO);
                }
            });
        }
    }

    const onNodeDragStop = async (event, node) => {
        updateEntityPosition(node);
    }

    const renderFlow = () => {
        if (loadingBlocks) {
            return (
                <div className={'flex flex-col items-center justify-center bg-kuwala-bg-gray w-full h-full text-kuwala-green'}>
                    <Spinner size={'xl'}/>
                    <span className={'indent-2 text-xl mt-8 text-gray-500'}>
                        Loading configured blocks...
                    </span>
                </div>
            )
        }

        if (dataSource.length > 0) {
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
                    <Sidebar
                        reactFlowWrapper={reactFlowWrapper}
                    />
                    {renderFlow()}
                </div>
                <DataBlockConfigModal
                    isOpen={openConfigModal}
                    configData={selectedElement}
                />
                <TransformationCatalogModal
                    isOpen={openTransformationCatalogModal}
                />
                <TransformationBlockConfigModal
                    isOpen={openTransformationConfigModal}
                />
            </div>
        </div>
    )
}

export default App;
