import React, {Fragment} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {CheckBox, Tag} from "../../../Common";
import styles from "./styles";
import Spinner from "../../../Common/Spinner";
import Button from "../../../Common/Button";

const SelectorTable = ({ data, selectedTable}) => {
    const { selectedElement } = useStoreState(({ canvas }) => canvas);
    const { selectedAddressObj } = useStoreState(({ dataBlocks }) => dataBlocks);
    const { insertOrRemoveSelectedColumnAddress } = useStoreActions(({ dataBlocks }) => dataBlocks);
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

    const populatedData = data.map((el)=> {
        return {
            ...el,
            selected: listOfSelectedColumn.includes(el.column),
        }
    });

    const renderHeader = () => {
        return (
            <div className={styles.selectorTableHeader}>
                <div  className={styles.selectorTableCheckboxHeader} />

                <div className={styles.selectorTableNameHeader}>name</div>

                <div className={styles.selectorTableTypeHeader}>type</div>
            </div>
        )
    }

    const renderRow = ({ column, columnAddress, selected, type }, index) => {
        return (
            <div key={index} className={styles.selectorTableRow}>
                <div className={styles.selectorTableCheckbox}>
                    <CheckBox
                        checked={selected}
                        onClick={() => {
                            insertOrRemoveSelectedColumnAddress({
                                columnAddress: columnAddress,
                                dataBlockId
                            })
                        }}
                    />
                </div>

                <div className={styles.selectorTableName}>
                    {column}
                </div>

                <div className={styles.selectorTableType}>
                    <Tag text={type} color={'gray'} size={'sm'} />
                </div>
            </div>
        )
    }

    return (
        <div className={styles.selectorTableContainer}>
            {renderHeader()}
            {populatedData.map(renderRow)}
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
            <SelectorTable
                columns={columnsPreview.columns}
                data={columnsPreview.rows}
                selectedTable={selectedTable}
            />
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
