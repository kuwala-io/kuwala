import {getDataDictionary} from "../../../utils/SchemaUtils";
import ReactTable from "react-table-6";
import React from "react";

const ExampleTable = ({ columns, rows }) => {
    let populatedColumns = columns.map((el) => {
        return {
            Header: el,
            accessor: el,
        }
    });

    populatedColumns = [{
        Header: "",
        id: "row",
        filterable: false,
        width: 48,
        Cell: (row) => {
            return <div>{row.index+1}</div>;
        }
    }, ...populatedColumns];
    const populatedRows = getDataDictionary(rows, columns);

    return (
        <div className={'transformation-example h-full'}>
            <ReactTable
                data={populatedRows}
                columns={populatedColumns}
                defaultPageSize={populatedRows.length >= 10 ? 10 : populatedRows.length}
                showPagination={false}
                showPaginationTop={false}
                showPaginationBottom={false}
                showPageSizeOptions={false}
                style={{
                    height: "100%",
                }}
            />
        </div>
    );
}

export default ExampleTable;
