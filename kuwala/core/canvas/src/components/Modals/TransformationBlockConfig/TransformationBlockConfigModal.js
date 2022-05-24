import Modal from "../../Common/Modal";
import React, {Fragment, useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import { TRANSFORMATION_BLOCK } from "../../../constants/nodeTypes";
import {Formik, useFormikContext} from "formik";
import { getEntityElementEntityBlockId } from "../../../utils/BlockUtils";
import {createTransformationBlock} from "../../../api/TransformationBlock";
import {getElementByIds} from "../../../utils/ElementUtils";
import TransformationBlockDTO from "../../../data/dto/TransformationBlockDTO";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import TransformationBlockConfigBody from './TransformationBlockConfigBody'
import TransformationBlockConfigHeader from './TransformationBlockConfigHeader'
import TransformationBlockConfigFooter from './TransformationBlockConfigFooter'

const TransformationBlockConfigModal = ({isOpen}) => {
    const {toggleTransformationConfigModal} = useStoreActions(actions => actions.common);
    const {updateTransformationBlock} = useStoreActions(actions => actions.canvas);
    const {selectedElement, elements} = useStoreState(state => state.canvas);
    const [transformationBlockName, setTransformationBlockName] = useState(undefined);
    const [showToolTip, setShowToolTip] = useState(false);
    const [isTransformationBlockSaveLoading, setIsTransformationBlockSaveLoading] = useState(false);
    const [submitData, setSubmitData] = useState(null);

    useEffect( () => {
        initNodeName()
    }, [selectedElement])

    const onNameChange = (event) => {
        setTransformationBlockName(event.target.value);
    }

    const initNodeName = () => {
        if(selectedElement && selectedElement.type === TRANSFORMATION_BLOCK) {
            setTransformationBlockName(selectedElement.data.transformationBlock.name)
        }else {
            setTransformationBlockName('');
        }
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
        let params = selectedElement.data.transformationCatalog.macroParameters.map(mapParameter);

        if(selectedElement.data.transformationBlock.isConfigured) {
            params = selectedElement.data.transformationBlock.macroParameters;
        }
        
        let materializeTable = selectedElement.data.transformationBlock.materializeTable;
        let tfBlockName = transformationBlockName;

        if(submitData !== null) {
            params = submitData.parameters;
            materializeTable = submitData.materializeTable;
            tfBlockName = submitData.transformationBlockName;
        }

        return (
            <Formik
                initialValues={{
                    parameters: params,
                    materializeTable: materializeTable,
                    transformationBlockName: tfBlockName,
                }}
                onSubmit={async (values)=>{
                    setSubmitData(values);
                    await upsertTransformationBlocks({ values });
                    setSubmitData(null);
                }}
                children={() => (
                    <>
                        {children}
                    </>
                )}
            />
        )
    }

    const toggleConfigModalWrapper = () => {
        toggleTransformationConfigModal();
        setSubmitData(null);
    }

    const upsertTransformationBlocks = async ({values}) => {
        setIsTransformationBlockSaveLoading(true);
        const connectedElements = getElementByIds(elements, selectedElement.data.transformationBlock.connectedSourceNodeIds);
        const connectedBlocks = connectedElements.map((el) => getEntityElementEntityBlockId(el));
        const mapParameter = (param) => {
            let value = param.value;

            if (param.type === 'date') {
                value = moment(param.value).format('YYYY-MM-DD')
            } else if (param.id === 'aggregated_columns') {
                value = param.value.map(({ column, aggregation }) => `${column}KUWALA_AGG${aggregation}`);
            }

            return { ...param, value };
        }

        if (!selectedElement.data.transformationBlock.transformationBlockEntityId) {
            const parsedValues = {
                ...values,
                parameters: values.parameters.map(mapParameter)
            }
            const data = {
                transformation_catalog_item_id: selectedElement.data.transformationCatalog.id,
                input_block_ids: connectedBlocks,
                macro_parameters: parsedValues.parameters.map((el) => {
                    return {
                        id: el.id,
                        value: el.value
                    }
                }),
                name: values.transformationBlockName,
                materialize_as_table: values.materializeTable,
                position_x: selectedElement.position.x,
                position_y: selectedElement.position.y,
            }

            try {
                const res = await createTransformationBlock(data);

                if(res.status === 200) {
                    const dto = new TransformationBlockDTO({
                        transformationCatalog: selectedElement.data.transformationCatalog,
                        name: values.transformationBlockName,
                        connectedSourceNodeIds: selectedElement.data.transformationBlock.connectedSourceNodeIds,
                        transformationBlockId: selectedElement.data.transformationBlock.transformationBlockId,
                        connectedTargetNodeIds: selectedElement.data.transformationBlock.connectedTargetNodeIds,
                        isConfigured: true,
                        macroParameters: values.parameters,
                        transformationCatalogItemId: selectedElement.data.transformationBlock.transformationCatalogItemId,
                        transformationBlockEntityId: res.data.id,
                        materializeTable: values.materializeTable,
                        columns: res.data.columns,
                        positionX: res.data.position_x,
                        positionY: res.data.position_y,
                        inputBlockIds: connectedBlocks,
                    })
                    updateTransformationBlock(dto);
                    toggleTransformationConfigModal();
                    setTransformationBlockName(values.transformationBlockName);
                }
            } catch(e){
                alert('Failed to create transformation block')
            } finally {
                setIsTransformationBlockSaveLoading(false);
            }
        } else {
            // TODO: Update data block (not implemented completely in backend)
            alert('Updating transformation blocks is currently not supported');

            setIsTransformationBlockSaveLoading(false);
        }
    }

    const ConfigBodyAndFooter = React.memo(() => {
        const { setFieldValue, submitForm, values  } = useFormikContext();

        return (
            <Fragment>
                <TransformationBlockConfigBody
                    elements={elements}
                    selectedElement={selectedElement}
                    setFieldValue={setFieldValue}
                    setShowToolTip={setShowToolTip}
                    setSubmitData={setSubmitData}
                    showToolTip={showToolTip}
                    values={values}
                />

                <TransformationBlockConfigFooter
                    isTransformationBlockSaveLoading={isTransformationBlockSaveLoading}
                    submitForm={submitForm}
                    toggleConfigModalWrapper={toggleTransformationConfigModal}
                />
            </Fragment>
        )
    });

    return (
        <Modal
            isOpen={isOpen}
            closeModalAction={toggleConfigModalWrapper}
        >
            <TransformationBlockConfigHeader
                onNameChange={onNameChange}
                selectedElement={selectedElement}
                transformationBlockName={transformationBlockName}
            />

            <FormikWrapper>
                <ConfigBodyAndFooter />
            </FormikWrapper>
        </Modal>
    )
}

export default TransformationBlockConfigModal;
