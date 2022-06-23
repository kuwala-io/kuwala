import React, {Fragment} from "react";
import {prePopulate, tableAddressSplitter} from "../../utils/TableSelectorUtils";
import {getColumns} from "../../api/DataSourceApi";
import {SELECTOR_DISPLAY} from "../../constants/components";
import {getTablePreview} from "../../api/DataSourceApi";
import {getDataDictionary, generateParamsByDataSourceType, getDatabaseTitleValue} from "../../utils/SchemaUtils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faAngleRight,
    faFolderClosed,
    faList,
    faTable
} from "@fortawesome/free-solid-svg-icons";
import {useStoreState} from "easy-peasy";
import styles from "./styles";
import Spinner from "../Common/Spinner";

const mapTablePreview = async ({
    category,
    dataSourceId,
    params,
    schema,
    selectedAddressObj,
    selectedElement,
    table
}) => {
    let selectedCols = [];

    try {
        selectedCols = selectedAddressObj[selectedElement.data.dataBlock.dataBlockId][schema][category][table];
    } catch (e) {}

    if (selectedCols.length > 0) {
        params.columns = selectedCols
    }

    let previewResponse;

    try {
        previewResponse = await getTablePreview({
            id: dataSourceId,
            params
        });
    } catch (error) {
        console.error(error);

        return;
    }

    let columns = previewResponse.data.columns.map((el) => {
        return {
            Header: el,
            accessor: el
        }
    });

    return {
        columns,
        rows: getDataDictionary(previewResponse.data.rows, previewResponse.data.columns),
    };
}

const SchemaExplorer = ({
    schemaExplorerType,
    selectedTable,
    setSelectedTable,
    isSchemaLoading,
    schemaList,
    setSchema,
    setIsTableLoading,
    setColumnsPreview,
    setTableDataPreview,
    dataSource,
}) => {
    const { selectedElement } = useStoreState(({ canvas }) => canvas);
    const { selectedAddressObj } = useStoreState(({ dataBlocks }) => dataBlocks);

    const tableColumnSelectorOnClick = async ({ addressString }) => {
        setIsTableLoading(true);
        setSelectedTable(addressString);

        const params = generateParamsByDataSourceType(dataSource.dataCatalogItemId, addressString);

        try {
            const res = await getColumns({
                id: dataSource.id,
                params
            });

            if (res.status === 200) {
                setColumnsPreview({
                    columns: [],
                    rows: prePopulate(res.data, addressString),
                });
            }
        } catch (e) {
            console.error('Failed to populate by selected block', e)
        }

        setIsTableLoading(false);
    }

    const tablePreviewSelectorOnClick  = async ({addressString}) => {
        setIsTableLoading(true);
        setSelectedTable(addressString);

        const params = generateParamsByDataSourceType(dataSource.dataCatalogItemId, addressString);
        const {schema, table, category} = tableAddressSplitter(addressString);
        const dataPreview = await mapTablePreview({
            category,
            dataSourceId: dataSource.id,
            params,
            schema,
            selectedAddressObj,
            selectedElement,
            table
        });

        setTableDataPreview(dataPreview);
        setIsTableLoading(false);
    }

    const renderDataPreviewTree = () => {
        return (
            <Fragment>
                <div className={styles.titleContainer}>
                    Database: {getDatabaseTitleValue(dataSource)}
                </div>

                <div className={styles.schemaContainer}>
                    {isSchemaLoading
                        ?
                        <div className={styles.spinnerContainer}>
                            <Spinner size={'xl'} />
                        </div>
                        :
                        schemaList.map((element, index) => renderSchemaBlock(element, index))
                    }
                </div>
            </Fragment>
        )
    }

    const renderSchemaBlock = (schema, index) => {
        return (
            <div key={index} className={styles.schemaBlockContainer}>
                {generateSchemaParent(schema)}
                {schema.isOpen ? generateCategories(schema.categories, schema.schema) : null}
            </div>
        )
    }

    const generateSchemaParent = (schemaObject) => {
        return (
            <div
                className={styles.schemaBlock}
                onClick={() => {
                    toggleTreeItem(schemaObject.schema);
                }}
            >
                <span className={styles.iconContainer}>
                    <FontAwesomeIcon
                        className={styles.icon}
                        icon={schemaObject.isOpen ? faAngleDown : faAngleRight}
                    />
                </span>

                <span className={styles.iconContainer}>
                    <FontAwesomeIcon
                        className={styles.icon}
                        icon={faList}
                    />
                </span>

                <span className={styles.rowName}>
                    {schemaObject.schema}
                </span>
            </div>
        )
    }

    const generateCategories = (categories, parentSchema) => {
        return (
            categories.map((el) => {
                const currentKey = `${parentSchema}@${el.category}`

                return (
                    <div
                        key={currentKey}
                        className={styles.categoriesOuterContainer}
                    >
                        <div
                            className={styles.categoriesInnerContainer}
                            onClick={() => {
                                toggleTreeItem(currentKey)
                            }}
                        >
                            <span className={styles.iconContainer}>
                                <FontAwesomeIcon
                                    className={styles.icon}
                                    icon={el.isOpen ? faAngleDown : faAngleRight}
                                />
                            </span>

                            <span className={styles.iconContainer}>
                                <FontAwesomeIcon
                                    className={styles.icon}
                                    icon={faFolderClosed}
                                />
                            </span>

                            <span className={styles.rowName}>
                                {el.category}
                            </span>
                        </div>

                        {el.isOpen ?
                            el.tables.map(el => generateCategoryTables(el, currentKey))
                            : null
                        }
                    </div>
                );
            })
        );
    };

    const getOnClickEventByType = async ({ addressString }) => {
        if (schemaExplorerType === SELECTOR_DISPLAY) {
            await tableColumnSelectorOnClick({ addressString });
        } else {
            await tablePreviewSelectorOnClick({ addressString });
        }
    }

    const generateCategoryTables = (tableName, parent) => {
        const tableKey = `${parent}@${tableName}`;

        return (
            <div
                className={`
                    ${styles.tableRow}
                    ${tableKey === selectedTable ? ` bg-kuwala-green text-white` : ` bg-white text-black`}
                `}
                key={tableKey}
                onClick={async () => {
                    await getOnClickEventByType({
                        addressString: tableKey
                    });
                }}
            >
                <span className={styles.iconContainer}>
                    <FontAwesomeIcon
                        className={styles.icon}
                        icon={faTable}
                    />
                </span>

                <span className={styles.rowName}>
                    {tableName}
                </span>
            </div>
        )
    }

    const toggleTreeItem = (addressString) => {
        const arr = addressString.split('@')
        const schemaAddress = arr[0]
        const categoryAddress = arr[1]
        let tempSchema;

        if (categoryAddress && schemaAddress) {
            tempSchema = schemaList.map((el) => {
                if (el.schema === schemaAddress) {
                    return {
                        ...el,
                        categories: el.categories.map((cat) => {
                            if (cat.category === categoryAddress){
                                cat.isOpen = !cat.isOpen;
                            }

                            return cat;
                        })
                    }
                }

                return el;
            });
        } else {
            tempSchema = schemaList.map((el) => {
                if (el.schema === schemaAddress){
                    el.isOpen = !el.isOpen;

                    if (el.isOpen === false) {
                        return {
                            ...el,
                            categories: el.categories.map((cat) => {
                                cat.isOpen = false
                                return cat
                            })
                        };
                    }
                }

                return el;
            })
        }

        setSchema(tempSchema);
    }

    return (
        renderDataPreviewTree()
    )
}

export {
    mapTablePreview,
    SchemaExplorer
};
