import React from "react";
import "./selector-style.css";
import {useStoreActions} from "easy-peasy";
import {SELECTOR_DISPLAY} from "../../constants/components";
import ExplorerSelectorBody from "./ExplorerBody/ExplorerSelectorBody";
import ExplorerPreviewBody from "./ExplorerBody/ExplorerPreviewBody";

const Explorer = ({
    displayType,
    selectedTable,
    isTableLoading,
    columnsPreview,
    tableDataPreview
}) => {
    const {
        deselectAllColumnAddress,
        selectAllColumnAddresses
    } = useStoreActions(({ dataBlocks }) => dataBlocks);

    const renderDataPreviewBody = () => {
        if (displayType === SELECTOR_DISPLAY) {
            return (
                <ExplorerSelectorBody
                    isTableLoading={isTableLoading}
                    selectedTable={selectedTable}
                    columnsPreview={columnsPreview}
                    deselectAllColumnAddress={deselectAllColumnAddress}
                    selectAllColumnAddresses={selectAllColumnAddresses}
                />
            );
        } else {
            return (
                <ExplorerPreviewBody
                    selectedTable={selectedTable}
                    isTableLoading={isTableLoading}
                    tableDataPreview={tableDataPreview}
                />
            );
        }
    }

    return (
        renderDataPreviewBody()
    )
}

export default Explorer;
