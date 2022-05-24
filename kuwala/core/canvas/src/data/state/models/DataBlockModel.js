import {action, thunk} from "easy-peasy";
import {DATA_BLOCK} from "../../../constants/nodeTypes";
import {getNodeTypeByDataCatalogId} from '../utils';
import DataBlockDTO from "../../dto/DataBlockDTO";


const getLabelByDataCatalogId = (catalogId) => {
    switch (catalogId){
        case('postgres'):
            return 'Postgres'
        case('bigquery'):
            return 'BigQuery'
        case('snowflake'):
            return 'Snowflake'
        default:
            return 'Invalid Label'
    }
}

const columnAddressSplitter = (columnAddress) => {
    const addressArray = columnAddress.split('@');

    return {
        schema: addressArray[0],
        category: addressArray[1],
        table: addressArray[2],
        column: addressArray[3],
    }
}

const DataBlockModel = {
    dataBlocks: [],
    selectedAddressObj: {},
    setDataBlocks: action((state, dataBlocks) => {
        state.dataBlocks = dataBlocks;
    }),
    addDataBlock: action((state, newDataBlock) => {
        state.dataBlocks = [...state.dataBlocks, newDataBlock]
    }),
    removeDataBlock: thunk(({ setDataBlocks}, dataBlockId, { getState }) => {
        const { dataBlocks } = getState();

        setDataBlocks(dataBlocks.filter((el) => el.dataBlockId !== dataBlockId));
    }),
    convertDataBlocksIntoElements: thunk(async (
        { updateNodePayloadByDataBlock },
        { addNode, elements, setElements },
        { getState }
    ) => {
        const { dataBlocks } = getState();

        dataBlocks.forEach((block) => {
            const existingElement = elements.find(element => (
                element.type === DATA_BLOCK && (
                    element.data.dataBlock.dataBlockId === block.dataBlockId ||
                    element.data.dataBlock.dataBlockEntityId === block.dataBlockEntityId
                )
            ));
            const nodeInfo = {
                type: getNodeTypeByDataCatalogId(block.dataCatalogType),
                data: {
                    label: getLabelByDataCatalogId(block.dataCatalogType),
                    dataSource: block.dataSourceDTO,
                    dataBlock: {...block},
                },
                sourcePosition: 'right',
            }

            if (existingElement) {
                // If same node exists -> Update the node info
                updateNodePayloadByDataBlock({
                    dataBlockId: block.dataBlockId,
                    elements,
                    setElements,
                    updatedNodeInfo: nodeInfo
                })
            } else {
                // Else add new node
                let position = {
                    x: -100,
                    y: Math.random() * window.innerHeight / 2,
                };

                if (nodeInfo.data.dataBlock.positionX && nodeInfo.data.dataBlock.positionY) {
                    position = {
                        x: nodeInfo.data.dataBlock.positionX,
                        y: nodeInfo.data.dataBlock.positionY
                    }
                }

                addNode({ ...nodeInfo, position });
            }
        });
    }),
    updateNodePayloadByDataBlock: thunk(async (
        actions,
        { dataBlockId, elements, setElements, updatedNodeInfo }
    ) => {
        setElements(elements.map((el) => {
            if (el.type !== DATA_BLOCK) return el

            if (el.data.dataBlock.dataBlockId === dataBlockId) {
                return {
                    ...el,
                    data: updatedNodeInfo.data,
                    position: {
                        x: updatedNodeInfo.data.dataBlock.positionX || el.position.x,
                        y: updatedNodeInfo.data.dataBlock.positionY || el.position.y
                    }
                }
            } else {
                return el
            }
        }));
    }),
    updateDataBlock: thunk((
        { convertDataBlocksIntoElements, setDataBlocks },
        { addNode, elements, setElements, updatedBlock },
        { getState }
    ) => {
        const { dataBlocks } = getState();
        const blocks = dataBlocks.map((curEl) => {
            if (curEl.dataBlockId === updatedBlock.dataBlockId) {
                return new DataBlockDTO({ ...updatedBlock });
            } else {
                return curEl
            }
        });

        setDataBlocks(blocks);
        convertDataBlocksIntoElements({ addNode, elements, setElements });
    }),
    updateDataBlockPosition: thunk((
        { setDataBlocks },
        { dataBlockId, positionX, positionY },
        { getState }
    ) => {
        const { dataBlocks } = getState();
        const blocks = dataBlocks.map((element) => {
            if (element.dataBlockId === dataBlockId) {
                return new DataBlockDTO({ ...element, positionX, positionY });
            } else {
                return element
            }
        });

        setDataBlocks(blocks);
    }),
    addSelectedColumnAddress: action((state, { newAddress, dataBlockId }) => {
        const addressArray = newAddress.split('@');
        const schema = addressArray[0];
        const category = addressArray[1];
        const table = addressArray[2];
        const column = addressArray[3];
        let tmpState = state.selectedAddressObj;

        if (typeof tmpState[dataBlockId] === 'undefined') {
            tmpState[dataBlockId] = {
                [schema]: {
                    [category]: {
                        [table]: [column]
                    }
                }
            }
        } else if (typeof tmpState[dataBlockId][schema] === 'undefined') {
            tmpState[dataBlockId][schema] = {
                [category]: {
                    [table]: [column]
                }
            };
        } else if (typeof tmpState[dataBlockId][schema][category] === 'undefined') {
            tmpState[dataBlockId][schema][category] = {
                [table]: [column]
            };
        } else if (typeof tmpState[dataBlockId][schema][category][table] === 'undefined') {
            tmpState[dataBlockId][schema][category][table] = [column];
        } else {
            if (!tmpState[dataBlockId][schema][category][table].includes(column)) {
                tmpState[dataBlockId][schema][category][table].push(column);

                state.selectedAddressObj = tmpState;
            }
        }
    }),
    generateStructureIfNotExists: action((state, { columnAddress, dataBlockId }) => {
        const {schema, category, table} = columnAddressSplitter(columnAddress);
        let tempState = state.selectedAddressObj;

        if (typeof tempState[dataBlockId] === 'undefined') {
            tempState[dataBlockId] = {
                [schema]: {
                    [category]: {
                        [table]: []
                    }
                }
            };
        } else if (typeof tempState[dataBlockId][schema] === 'undefined') {
            tempState[dataBlockId][schema] = {
                [category]: {
                    [table]: []
                }
            };
        } else if (typeof tempState[dataBlockId][schema][category] === 'undefined') {
            tempState[dataBlockId][schema][category] = {
                [table]: []
            };
        } else if (typeof tempState[dataBlockId][schema][category][table] === 'undefined') {
            tempState[dataBlockId][schema][category][table] = [];
        }

        state.selectedAddressObj = tempState
    }),
    selectAllColumnAddresses: thunk(({ addSelectedColumnAddress}, { bulkAddress, dataBlockId }) => {
        if (!bulkAddress || !bulkAddress.length) return

        bulkAddress.forEach((address) => addSelectedColumnAddress({
            newAddress: address,
            dataBlockId
        }))
    }),
    deselectAllColumnAddress: thunk(({ removeSelectedColumnAddress }, { bulkAddress, dataBlockId }) => {
        if (!bulkAddress || !bulkAddress.length) return

        bulkAddress.forEach((address) => removeSelectedColumnAddress({
            addressToRemove: address,
            dataBlockId
        }))
    }),
    insertOrRemoveSelectedColumnAddress: thunk(async (
        { addSelectedColumnAddress, generateStructureIfNotExists, removeSelectedColumnAddress },
        { columnAddress, dataBlockId },
        { getState }
    ) => {
        generateStructureIfNotExists({ columnAddress, dataBlockId });

        const { selectedAddressObj } = getState();
        const { schema, category, table, column } = columnAddressSplitter(columnAddress);

        if (selectedAddressObj[dataBlockId][schema][category][table].includes(column)) {
            removeSelectedColumnAddress({
                addressToRemove: columnAddress,
                dataBlockId
            });
        } else {
            addSelectedColumnAddress({
                newAddress: columnAddress,
                dataBlockId
            });
        }
    }),
    removeSelectedColumnAddress: action((state, {addressToRemove, dataBlockId}) => {
        const { schema, category, table, column } = columnAddressSplitter(addressToRemove);
        let tmpState = state.selectedAddressObj;

        try {
            tmpState[dataBlockId][schema][category][table] = tmpState[dataBlockId][schema][category][table].filter((el) => el !== column)
        } catch (e) {
            console.error(e)
        }

        state.selectedAddressObj = tmpState;
    }),
}

export default DataBlockModel;
