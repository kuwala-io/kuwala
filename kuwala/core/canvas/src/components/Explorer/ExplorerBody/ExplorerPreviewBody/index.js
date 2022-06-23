import React, {useMemo} from "react";
import Spinner from "../../../Common/Spinner";
import styles from "./styles";
import {PREVIEW_DISPLAY, SELECTOR_DISPLAY} from "../../../../constants/components";
import {Table} from "../../../Common";

const PreviewTable = ({ columns, data }) => {
    const memoizedCols = useMemo(() => {
        return columns;
    },[columns]);

    const memoizedRows = useMemo(() => {
        return data;
    },[data]);

    return (
        <Table
            columns={memoizedCols}
            data={memoizedRows}
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
        <div className={selectorDisplay !== SELECTOR_DISPLAY && styles.previewTableContainer}>
            <PreviewTable columns={tableDataPreview.columns} data={tableDataPreview.rows} />
        </div>
    );
};

export default ExplorerPreviewBody;
