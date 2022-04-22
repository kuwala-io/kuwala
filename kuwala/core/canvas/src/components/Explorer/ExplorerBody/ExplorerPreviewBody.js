import React, {useMemo} from "react";
import ReactTable from "react-table-6";

const PreviewTable = ({columns, data}) => {
    const memoizedCols = useMemo(()=> {
        return columns
    },[]);

    const memoizedRows = useMemo(()=> {
        return data
    },[]);

    let pageSize;
    if (data.length >= 300) pageSize = 300
    else if (data.length <= 20) pageSize = 20;
    else pageSize = data.length

    return (
        <ReactTable
            data={memoizedRows}
            columns={memoizedCols}
            defaultPageSize={pageSize}
            showPagination={false}
            showPaginationTop={false}
            showPaginationBottom={false}
            showPageSizeOptions={false}
            style={{
                height: "100%",
                overFlowX: 'hidden',
            }}
            className="-striped -highlight"
        />
    )
}

export default ({selectedTable, isTableLoading, wrapperClasses, tableDataPreview}) => {
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
                        <div
                            className={
                                wrapperClasses ? wrapperClasses : `
                                        'flex flex-col overflow-x-auto mx-8 mb-8 rounded-lg border-2 border-kuwala-green'
                                    `
                            }
                        >
                            <PreviewTable columns={tableDataPreview.columns} data={tableDataPreview.rows}/>
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