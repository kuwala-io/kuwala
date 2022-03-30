import React from "react";

export const populateAPIResult = ({res, setColumnsPreview, addressString}) => {
    setColumnsPreview({
        columns: [],
        rows: prePopulate(res.data, addressString),
    });
}

export const prePopulate = (raw, addressString) => {
    return raw.map((el)=> {
        return {
            ...el,
            selected: false,
            columnAddress: `${addressString}@${el.column}`
        }
    });
}

export const columnAddressSplitter = (columnAddress) => {
    const addressArray = columnAddress.split('@');
    return {
        schema: addressArray[0] || null,
        category: addressArray[1] || null,
        table: addressArray[2] || null,
        column: addressArray[3] || null,
    }
}

export const tableAddressSplitter = (tableAddress) => {
    const addressArray = tableAddress.split('@');
    return {
        schema: addressArray[0] || null,
        category: addressArray[1] || null,
        table: addressArray[2] || null,
    }
}