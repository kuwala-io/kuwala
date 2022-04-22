import {getTablePreview} from "../api/DataSourceApi";
import React from "react";
import {generateParamsByDataSourceType, getDataDictionary} from "./SchemaUtils";

export const tableSelectionOnClick = async ({addressString, setSelectedTable, setIsTableDataPreviewLoading, dataCatalogItemId, dataIndex, setTableDataPreview, selectedAddressObj}) => {
    setSelectedTable(addressString)
    setIsTableDataPreviewLoading(true)
    const params = generateParamsByDataSourceType(dataCatalogItemId, addressString)
    const res = await getTablePreview({
        id: dataIndex,
        params
    });

    if(res.status === 200) {
        let cols = res.data.columns.map((el,i)=>{
            return {
                Header: el,
                accessor: el,
            }
        });

        cols = [{
            Header: "#",
            id: "row",
            filterable: false,
            width: 50,
            Cell: (row) => {
                return <div>{row.index+1}</div>;
            }
        }, ...cols]

        setTableDataPreview({
            columns: cols,
            rows: getDataDictionary(res.data.rows, res.data.columns),
        });
    }
    setIsTableDataPreviewLoading(false)
}