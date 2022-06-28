import React, {useCallback, useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {getDataBlockPreview} from "../../api/DataBlockApi";
import {getDataDictionary} from "../../utils/SchemaUtils";
import {DATA_BLOCK, TRANSFORMATION_BLOCK} from "../../constants/nodeTypes";
import {getTransformationBlockPreview} from "../../api/TransformationBlock";
import { Table } from '../Common';
import styles from "./styles";
import CloseButton from "../Common/CloseButton";
import Spinner from "../Common/Spinner";

const DataView = () => {
    const { selectedElement, openDataView } = useStoreState(({ canvas }) => canvas);
    const {toggleDataView} = useStoreActions(({ canvas }) => canvas);
    const [isDataPreviewLoading, setIsDataPreviewLoading] = useState(false);
    const [blocksPreview, setBlocksPreview] = useState({
        columns: [],
        rows: [],
    });

    const fetchDataBlockPreview = useCallback(async () => {
        setIsDataPreviewLoading(true);

        const block = selectedElement.data.dataBlock;

        try {
            const res = await getDataBlockPreview({
                dataBlockId: block.dataBlockEntityId,
                params: {
                    limit_columns: 300,
                    limit_rows: 300,
                }
            });

            if (res.status === 200) {
                let cols = res.data.columns.map((el) => {
                    return {
                        Header: el,
                        accessor: el,
                    }
                });

                setBlocksPreview({
                    columns: cols,
                    rows: getDataDictionary(res.data.rows, res.data.columns),
                });
            }
        } catch (e) {
            console.error('Failed to fetch data block preview', e)
        } finally {
            setIsDataPreviewLoading(false);
        }
    }, [selectedElement.data.dataBlock]);

    const fetchTransformationBlockPreview = useCallback(async () => {
        setIsDataPreviewLoading(true);

        const block = selectedElement.data.transformationBlock;

        try {
            const res = await getTransformationBlockPreview({
                transformationBlockId: block.transformationBlockEntityId,
                params: {
                    limit_columns: 300,
                    limit_rows: 300,
                }
            });

            if (res.status === 200) {
                let cols = res.data.columns.map((el) => {
                    return {
                        Header: el,
                        accessor: el,
                    };
                });

                setBlocksPreview({
                    columns: cols,
                    rows: getDataDictionary(res.data.rows, res.data.columns),
                });
            }
        } catch (e) {
            console.error('Failed to fetch transformation block preview', e);
        } finally {
            setIsDataPreviewLoading(false);
        }
    }, [selectedElement.data.transformationBlock]);

    const fetchPreviewFromSavedDataBlocks = useCallback(async () => {
        if (selectedElement) {
            if (selectedElement.type === DATA_BLOCK) {
                await fetchDataBlockPreview();
            } else if (selectedElement.type === TRANSFORMATION_BLOCK) {
                await fetchTransformationBlockPreview();
            }
        }
    }, [fetchDataBlockPreview, fetchTransformationBlockPreview, selectedElement]);

    useEffect(() => {
        if (openDataView) {
            fetchPreviewFromSavedDataBlocks().then(null)
        }
    }, [fetchPreviewFromSavedDataBlocks, openDataView])

    return (
        selectedElement &&
        <div className={styles.viewContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.closeButtonContainer}>
                    <CloseButton onClick={toggleDataView} />
                </div>


                {isDataPreviewLoading ?
                    <div className={styles.spinnerContainer}>
                        <Spinner size={'xl'} />
                    </div> :
                    <div className={styles.tableContainer}>
                        <Table columns={blocksPreview.columns} data={blocksPreview.rows} />
                    </div>
                }
            </div>
        </div>
    )
}

export default DataView;
