import React, {Fragment, useCallback, useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import ReactTable from "react-table-6";
import {CheckBox, Tag} from "../../../Common";
import styles from "./styles";
import Spinner from "../../../Common/Spinner";
import Button from "../../../Common/Button";

const SelectorTable = ({ data, selectedTable}) => {
    const { selectedElement } = useStoreState(({ canvas }) => canvas);
    const { selectedAddressObj } = useStoreState(({ dataBlocks }) => dataBlocks);
    const { insertOrRemoveSelectedColumnAddress } = useStoreActions(({ dataBlocks }) => dataBlocks);
    const [columns, setColumns] = useState(undefined);
    const dataBlockId = selectedElement.data.dataBlock.dataBlockId;
    const addressArray = selectedTable.split('@');
    const schema = addressArray[0];
    const category = addressArray[1];
    const table = addressArray[2];
    let listOfSelectedColumn = [];

    try {
        listOfSelectedColumn = selectedAddressObj[dataBlockId][schema][category][table];

        if (typeof listOfSelectedColumn === 'undefined') listOfSelectedColumn = [];
    } catch (e) {
        listOfSelectedColumn = []
    }

    const getColumns = useCallback(() => {
        return [{
            Header: "",
            id: "row",
            filterable: false,
            width: 48,
            Cell: (row) => {
                return (
                    <CheckBox
                        checked={row.original.selected}
                        onClick={() => {
                            insertOrRemoveSelectedColumnAddress({
                                columnAddress: row.original.columnAddress,
                                dataBlockId
                            })
                        }}
                    />
                );
            }
        }, {
            Header: 'Name',
            accessor: 'column',
            Cell: (row) => {
                return (
                    <div className={styles.name}>
                        {row.value}
                    </div>
                );
            }
        }, {
            Header: 'Type',
            accessor: 'type',
            Cell: (row) => {
                return (
                    <Tag text={row.value} color={'gray'} size={'sm'} />
                );
            }
        }]
    }, [dataBlockId, insertOrRemoveSelectedColumnAddress]);

    useEffect(() => {
        if (!columns) {
            setColumns(getColumns());
        }
    }, [columns, getColumns, setColumns])


    const populatedData = data.map((el)=> {
        return {
            ...el,
            selected: listOfSelectedColumn.includes(el.column),
        }
    });

    let pageSize;

    if (populatedData.length >= 300) pageSize = 300
    else pageSize = populatedData.length

    return (
        <div className={'selector-explorer h-full'}>
            <ReactTable
                data={populatedData}
                columns={columns || []}
                defaultPageSize={pageSize}
                showPagination={false}
                showPaginationTop={false}
                showPaginationBottom={false}
                showPageSizeOptions={false}
                style={{
                    height: "100%",
                    overFlowX: 'hidden',
                    overFlowY: 'auto',
                }}
            />
        </div>
    );
}

const ExplorerSelectorBody = ({
    columnsPreview,
    deselectAllColumnAddress,
    isTableLoading,
    selectAllColumnAddresses,
    selectedTable,
}) => {
    const { selectedElement } = useStoreState(({ canvas }) => canvas);
    const dataBlockId = selectedElement.data.dataBlock.dataBlockId;
    const addressList = columnsPreview.rows.map((el)=>{
        return el.columnAddress
    });

    const renderControls = () => {
        return (
            <div className={styles.controlsContainer}>
                <div className={styles.tagContainer}>
                    <Tag text={'Columns'} />
                </div>

                <div className={styles.selectionContainer}>
                    <Button
                        text={'Select all'}
                        onClick={() => {
                            selectAllColumnAddresses({
                                bulkAddress: addressList,
                                dataBlockId
                            });
                        }}
                        solid={false}
                    />

                    <Button
                        text={'Deselect all'}
                        onClick={() => {
                            deselectAllColumnAddress({
                                bulkAddress: addressList,
                                dataBlockId
                            });
                        }}
                        solid={false}
                    />
                </div>
            </div>
        );
    }

    const renderTable = () => {
        if (isTableLoading) {
            return (
                <div className={styles.spinnerContainer}>
                    <Spinner size={'xl'} />
                </div>
            )
        }

        return (
            <div className={styles.selectorTableContainer}>
                <SelectorTable
                    columns={columnsPreview.columns}
                    data={columnsPreview.rows}
                    selectedTable={selectedTable}
                />
            </div>
        )
    }

    const renderConfiguration = () => {
        return (
            <Fragment>
                {renderControls()}
                {renderTable()}
            </Fragment>
        )
    }

    const renderExplanation = () => {
        return (
            <div className={styles.explanationContainer}>
                <p>Select a table from the <span className={styles.textHighlight}>left</span></p>
                <p>to preview the data</p>
            </div>
        )
    }

    return (
        <Fragment>
            {selectedTable ?
                renderConfiguration() :
                renderExplanation()
            }
        </Fragment>
    )
};

export default ExplorerSelectorBody;
