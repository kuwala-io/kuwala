import React, {useMemo} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import ReactTable from "react-table-6";

const SelectorTable = ({columns, data, selectedTable}) => {
    const { selectedAddressObj, selectedElement } = useStoreState(state => state.canvas);
    const { insertOrRemoveSelectedColumnAddress } = useStoreActions(actions => actions.canvas);
    const dataBlockId = selectedElement.data.dataBlock.dataBlockId;

    const addressArray = selectedTable.split('@');
    const schema = addressArray[0];
    const category = addressArray[1];
    const table = addressArray[2];

    let listOfSelectedColumn = [];
    try{
        listOfSelectedColumn = selectedAddressObj[dataBlockId][schema][category][table];
        if(typeof listOfSelectedColumn === 'undefined') listOfSelectedColumn = [];
    } catch (e) {
        listOfSelectedColumn = []
    }

    const prepareColumn = () => {
        return [{
            Header: "",
            id: "row",
            filterable: false,
            width: 50,
            Cell: (row) => {
                return (
                    <div
                        className={`
                                flex flex-row justify-center items-center h-6 w-6 rounded-full
                                border-2 border-kuwala-green 
                                cursor-pointer
                                select-none
                            `}
                        onClick={()=> {
                            insertOrRemoveSelectedColumnAddress({
                                columnAddress: row.original.columnAddress,
                                dataBlockId: dataBlockId,
                            })
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faCheck}
                            className={`
                            h-4 w-4 text-kuwala-green
                            ${row.original.selected ? '' : 'hidden'}
                        `}
                        />
                    </div>
                );
            }
        }, {
            Header: 'name',
            accessor: 'column',
            Cell: (row) => {
                return <div className={'font-light select-none'}>
                    {row.value}
                </div>
            }
        }, {
            Header: 'type',
            accessor: 'type',
            Cell: (row) => {
                return (
                    <span className={'bg-gray-100 px-4 py-1 text-sm font-semibold text-gray-400 rounded-lg lowercase'}>
                        {row.value}
                    </span>
                );
            }
        }]
    }

    const memoizedCols = useMemo(()=> {
        return prepareColumn()
    },[]);

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
                columns={memoizedCols}
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
    )
}

export default ({columnsPreview, selectedTable, isTableLoading, selectAllColumnAddresses, deselectAllColumnAddress}) => {
    const { selectedElement } = useStoreState(state => state.canvas);
    const dataBlockId = selectedElement.data.dataBlock.dataBlockId;
    const addressList = columnsPreview.rows.map((el)=>{
        return el.columnAddress
    });
    return (
        <>
            {selectedTable
                ?
                isTableLoading
                    ?
                    <div className="flex flex-col w-full h-full justify-center items-center rounded-tr-lg">
                        <div
                            className="spinner-border animate-spin inline-block w-24 h-24 border-4 text-kuwala-green rounded-full"
                            role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                    :
                    <>
                        <div className={'flex flex-row justify-between mx-8 mb-4'}>
                            <div className={'flex flex-row items-center'}>
                                    <span
                                        className={'bg-kuwala-light-green px-4 py-1 font-semibold text-sm text-kuwala-green rounded-lg'}
                                    >Columns</span>
                            </div>
                            <div className={'flex flex-row space-x-2'}>
                                <button
                                    className={'bg-white px-4 py-1 text-sm font-semibold text-kuwala-green rounded-lg border-2 border-kuwala-green'}
                                    onClick={()=>{
                                        selectAllColumnAddresses({
                                            bulkAddress: addressList,
                                            dataBlockId: dataBlockId
                                        });
                                    }}
                                >Select All</button>
                                <button
                                    className={'bg-white px-4 py-1 text-sm font-semibold text-kuwala-green rounded-lg border-2 border-kuwala-green'}
                                    onClick={()=>{
                                        deselectAllColumnAddress({
                                            bulkAddress: addressList,
                                            dataBlockId: dataBlockId
                                        });
                                    }}
                                >Deselect All</button>
                            </div>
                        </div>
                        <div className={'flex flex-col overflow-x-auto mx-8 mb-8 rounded-lg border-2 border-kuwala-green'}>
                            <SelectorTable columns={columnsPreview.columns} data={columnsPreview.rows} selectedTable={selectedTable}/>
                        </div>
                    </>
                :
                <div className="flex flex-col w-full h-full text-xl font-light justify-center items-center rounded-tr-lg">
                    <p>Select a table from the <span className={'text-kuwala-green'}>left</span></p>
                    <p>to preview the data</p>
                </div>
            }
        </>
    )
}