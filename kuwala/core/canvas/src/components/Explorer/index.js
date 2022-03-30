import React, {useMemo} from "react";
import ReactTable from "react-table-6";
import "./selector-style.css";
import {useStoreActions, useStoreState} from "easy-peasy";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {SELECTOR_DISPLAY} from "../../constants/components";
import Explorer from "./index";
import ExplorerSelectorBody from "./ExplorerBody/ExplorerSelectorBody";
import ExplorerPreviewBody from "./ExplorerBody/ExplorerPreviewBody";

export default (
    {
        displayType,
        selectedTable,
        isTableLoading,
        columnsPreview,
        tableDataPreview,
        wrapperClasses
    }) => {
    const {selectAllColumnAddresses, deselectAllColumnAddress} = useStoreActions((actions) => actions.canvas);

    const renderDataPreviewBody = () => {
        if (displayType === SELECTOR_DISPLAY) {
            return <ExplorerSelectorBody
                isTableLoading={isTableLoading}
                selectedTable={selectedTable}
                columnsPreview={columnsPreview}
                deselectAllColumnAddress={deselectAllColumnAddress}
                selectAllColumnAddresses={selectAllColumnAddresses}
            />
        } else {
            return <ExplorerPreviewBody
                selectedTable={selectedTable}
                isTableLoading={isTableLoading}
                wrapperClasses={wrapperClasses}
                tableDataPreview={tableDataPreview}
            />
        }
    }

    return (
        renderDataPreviewBody()
    )
}