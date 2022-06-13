import React, {useMemo} from "react";
import ReactTable from "react-table-6";
import Spinner from "../../../Common/Spinner";
import styles from "./styles";
import {PREVIEW_DISPLAY, SELECTOR_DISPLAY} from "../../../../constants/components";

const PreviewTable = ({ columns, data }) => {
    const memoizedCols = useMemo(() => {
        return columns;
    },[columns]);

    const memoizedRows = useMemo(() => {
        return data;
    },[data]);
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
            className={styles.table}
        />
    )
}

const ExplorerPreviewBody = ({selectedTable, selectorDisplay = PREVIEW_DISPLAY, isTableLoading, tableDataPreview}) => {
    if (!selectedTable) {
        return (
            <div className={styles.explanationContainer}>
                <p>Select a table from the <span className={styles.textHighlight}>left</span></p>
                <p>to preview the data</p>
            </div>
        );
    }

    if (isTableLoading) {
        return (
            <div className={styles.spinnerContainer}>
                <Spinner size={'xl'} />
            </div>
        );
    }

    return (
        <div className={selectorDisplay === SELECTOR_DISPLAY && styles.previewTableContainer}>
            <PreviewTable columns={tableDataPreview.columns} data={tableDataPreview.rows} />
        </div>
    );
};

export default ExplorerPreviewBody;
