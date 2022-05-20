import SchemaExplorer from "../../SchemaExplorer";
import Explorer from "../../Explorer";
import React from "react";
import { Switcher } from '../../Common'
import { SELECTOR_DISPLAY, PREVIEW_DISPLAY } from "../../../constants/components";

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
        <div className={'flex flex-col flex-auto px-6 pt-2 pb-4 h-full overflow-y-auto'}>
            <div className={'flex flex-row bg-white border-2 border-kuwala-green rounded-t-lg h-full w-full'}>
                <div className={'flex flex-col bg-white w-3/12 border border-kuwala-green h-full'}>
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
                <div className={'flex flex-col bg-white w-9/12 rounded-tr-lg'}>
                    <div className={'flex flex-col w-full h-full'}>
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
