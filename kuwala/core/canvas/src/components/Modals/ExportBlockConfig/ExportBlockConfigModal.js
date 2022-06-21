import Modal from "../../Common/Modal";
import React, {Fragment, useCallback, useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {EXPORT_BLOCK} from "../../../constants/nodeTypes";
import {Formik, useFormikContext} from "formik";
import {getConnectedBlockWrapper} from "../../../utils/BlockUtils";
import {getElementByIds} from "../../../utils/ElementUtils";
import ExportBlockDTO from "../../../data/dto/ExportBlockDTO";
import "react-datepicker/dist/react-datepicker.css";
import ExportBlockConfigBody from './ExportBlockConfigBody'
import ExportBlockConfigHeader from './ExportBlockConfigHeader'
import ExportBlockConfigFooter from './ExportBlockConfigFooter'
import {createExportBlock, updateExportBlockEntity} from "../../../api/ExportBlock";
import {mapParametersForUpsert} from "../../../utils/MacroParameterUtils";

const ExportBlockConfigModal = ({isOpen}) => {
    const { addNode, setElements } = useStoreActions(({ canvas }) => canvas);
    const { toggleExportConfigModal } = useStoreActions(({ common }) => common);
    const { updateExportBlock } = useStoreActions(({ exportBlocks }) => exportBlocks);
    const { selectedElement, elements } = useStoreState(({ canvas }) => canvas);
    const [ exportBlockName, setExportBlockName ] = useState(undefined);
    const [ showToolTip, setShowToolTip ] = useState(false);
    const [ isExportBlockSaveLoading, setIsExportBlockSaveLoading ] = useState(false);
    const [ submitData, setSubmitData ] = useState(null);
    const initNodeName = useCallback(() => {
        if (selectedElement && selectedElement.type === EXPORT_BLOCK) {
            setExportBlockName(selectedElement.data.exportBlock.name)
        } else {
            setExportBlockName(undefined);
        }
    }, [selectedElement]);

    useEffect( () => {
        initNodeName()
    }, [initNodeName])

    const onNameChange = (event) => {
        setExportBlockName(event.target.value);
    }

    const FormikWrapper = ({children}) => {
        const mapParameter = (param) => {
            let value = '';

            if (param.id === 'aggregated_columns') {
                value = [{ column: null, aggregation: null}]
            } else if (param.type === 'list[text]') {
                value = ['']
            }

            return { ...param, value }
        }
        let params = selectedElement.data.exportCatalogItem.macroParameters.map(mapParameter);

        if(selectedElement.data.exportBlock.isConfigured) {
            params = selectedElement.data.exportBlock.macroParameters;
        }

        let materializeTable = selectedElement.data.exportBlock.materializeTable;
        let exBlockName = exportBlockName;

        if(submitData !== null) {
            params = submitData.parameters;
            materializeTable = submitData.materializeTable;
            exBlockName = submitData.exportBlockName;
        }

        return (
            <Formik
                initialValues={{
                    parameters: params,
                    materializeTable: materializeTable,
                    exportBlockName: exBlockName,
                }}
                onSubmit={async (values)=>{
                    setSubmitData(values);
                    await upsertExportBlock({ values });
                    setSubmitData(null);
                }}
                children={() => (
                    <Fragment>
                        {children}
                    </Fragment>
                )}
            />
        )
    }

    const toggleConfigModalWrapper = () => {
        toggleExportConfigModal();
        setSubmitData(null);
    }

    const upsertExportBlock = async ({values}) => {
        setIsExportBlockSaveLoading(true);
        const connectedElements = getElementByIds(elements, selectedElement.data.exportBlock.connectedSourceNodeIds);
        const connectedBlocks = getConnectedBlockWrapper(connectedElements);

        if (!selectedElement.data.exportBlock.exportBlockEntityId) {
            const parsedValues = {
                ...values,
                parameters: values.parameters.map(mapParametersForUpsert)
            }
            const data = {
                export_catalog_item_id: selectedElement.data.exportCatalogItem.id,
                input_block_ids: connectedBlocks,
                macro_parameters: parsedValues.parameters.map((el) => {
                    return {
                        id: el.id,
                        value: el.value
                    }
                }),
                name: values.exportBlockName,
                position_x: selectedElement.position.x,
                position_y: selectedElement.position.y,
            }

            try {
                const res = await createExportBlock(data);
                if(res.status === 200) {
                    const dto = new ExportBlockDTO({
                        exportCatalogItem: selectedElement.data.exportCatalogItem,
                        exportCatalogItemId: selectedElement.data.exportCatalogItemId,
                        exportBlockEntityId: res.data.id,
                        exportBlockId: selectedElement.data.exportBlock.exportBlockId,
                        name: values.exportBlockName,
                        connectedSourceNodeIds: selectedElement.data.exportBlock.connectedSourceNodeIds,
                        connectedTargetNodeIds: selectedElement.data.exportBlock.connectedTargetNodeIds,
                        isConfigured: true,
                        macroParameters: values.parameters,
                        columns: res.data.columns,
                        positionX: res.data.position_x,
                        positionY: res.data.position_y,
                        inputBlockIds: connectedBlocks,
                    })
                    updateExportBlock({ addNode, elements, setElements, updatedBlock: dto });
                    toggleExportConfigModal();
                    setExportBlockName(values.exportBlockName);
                }
            } catch(e){
                console.error(e);
            } finally {
                setIsExportBlockSaveLoading(false);
            }
        } else {
            const data = {
                name: values.exportBlockName,
                position_x: selectedElement.position.x,
                position_y: selectedElement.position.y,
            }

            const currentExportBlock = selectedElement.data.exportBlock;

            try {
                const res = await updateExportBlockEntity({
                    exportBlockEntityId: currentExportBlock.exportBlockEntityId,
                    data: data
                });
                if(res.status === 200) {
                    const dto = new ExportBlockDTO({
                        exportCatalogItem: selectedElement.data.exportCatalogItem,
                        exportCatalogItemId: selectedElement.data.exportCatalogItemId,
                        exportBlockEntityId: currentExportBlock.exportBlockEntityId,
                        exportBlockId: selectedElement.data.exportBlock.exportBlockId,
                        name: values.exportBlockName,
                        connectedSourceNodeIds: currentExportBlock.connectedSourceNodeIds,
                        connectedTargetNodeIds: currentExportBlock.connectedTargetNodeIds,
                        isConfigured: true,
                        macroParameters: currentExportBlock.macroParameters,
                        columns: currentExportBlock.columns,
                        positionX: res.data.position_x,
                        positionY: res.data.position_y,
                        inputBlockIds: currentExportBlock.inputBlockIds,
                    })
                    updateExportBlock({ addNode, elements, setElements, updatedBlock: dto });
                    toggleExportConfigModal();
                    setExportBlockName(values.exportBlockName);
                }
            } catch(e){
                console.error(e);
            } finally {
                setIsExportBlockSaveLoading(false);
            }

            setIsExportBlockSaveLoading(false);
        }
    }

    const ConfigBodyAndFooter = React.memo(() => {
        const { setFieldValue, submitForm, values  } = useFormikContext();
        return (
            <Fragment>
                <ExportBlockConfigBody
                    elements={elements}
                    selectedElement={selectedElement}
                    setFieldValue={setFieldValue}
                    setShowToolTip={setShowToolTip}
                    setSubmitData={setSubmitData}
                    showToolTip={showToolTip}
                    values={values}
                />

                <ExportBlockConfigFooter
                    isExportBlockSaveLoading={isExportBlockSaveLoading}
                    submitForm={submitForm}
                    toggleConfigModalWrapper={toggleConfigModalWrapper}
                />
            </Fragment>
        )
    });

    return (
        <Modal
            isOpen={isOpen}
            closeModalAction={toggleConfigModalWrapper}
        >
            <ExportBlockConfigHeader
                onNameChange={onNameChange}
                selectedElement={selectedElement}
                exportBlockName={exportBlockName}
            />

            <FormikWrapper>
                <ConfigBodyAndFooter />
            </FormikWrapper>
        </Modal>
    )
}

export default ExportBlockConfigModal;
