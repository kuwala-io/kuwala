import { SchemaExplorer } from "../../../SchemaExplorer";
import Explorer from "../../../Explorer";
import React from "react";
import { Switcher } from '../../../Common'
import { SELECTOR_DISPLAY, PREVIEW_DISPLAY } from "../../../../constants/components";
import styles from "./styles";

const DataBlockConfigBody = ({
     columnsPreview,
     isSchemaLoading,
     isTableLoading,
     schemaList,
     selectedElement,
     selectedTable,
     selectorDisplay,
     setColumnsPreview,
     setIsTableLoading,
     setSchema,
     setSelectedTable,
     setSelectorDisplay,
     setTableDataPreview,
     tableDataPreview
 }) => {
    return (
        <div className={styles.outerContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.schemaContainer}>
                    <SchemaExplorer
                        schemaExplorerType={selectorDisplay}
                        isSchemaLoading={isSchemaLoading}
                        schemaList={schemaList}
                        selectedTable={selectedTable}
                        setSchema={setSchema}
                        setSelectedTable={setSelectedTable}
                        setColumnsPreview={setColumnsPreview}
                        setTableDataPreview={setTableDataPreview}
                        setIsTableLoading={setIsTableLoading}
                        dataSource={selectedElement.data.dataSource}
                    />
                </div>

                <div className={styles.configOuterContainer}>
                    <div className={styles.configInnerContainer}>
                        <Switcher
                            leftId={SELECTOR_DISPLAY}
                            leftText={"Selection"}
                            onClick={setSelectorDisplay}
                            rightId={PREVIEW_DISPLAY}
                            rightText={"Preview"}
                            selectedId={selectorDisplay}
                        />

                        <Explorer
                            displayType={selectorDisplay}
                            columnsPreview={columnsPreview}
                            tableDataPreview={tableDataPreview}
                            isTableLoading={isTableLoading}
                            selectedTable={selectedTable}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DataBlockConfigBody;
