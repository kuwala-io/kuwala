import Modal from "../../Common/Modal";
import React, {useEffect, useRef, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {DATA_BLOCK, TRANSFORMATION_BLOCK} from "../../../constants/nodeTypes";
import Icon from "../../Common/Icon";
import Button from "../../Common/Button";
import {Field, Form, Formik, FieldArray, useFormikContext, useField} from "formik";
import {v4} from "uuid";
import {
    getDataBlockByDataBlockEntityId,
    getDataBlockByDataBlockId,
    getDataBlockByElementId, getEntityElementEntityBlockId,
    getTransformationBlockByElementId
} from "../../../utils/BlockUtils";
import Classes from './TransformationConfigModalStyle';
import {createTransformationBlock, updateTransformationBlockColumns} from "../../../api/TransformationBlock";
import {getElementById, getElementByIds} from "../../../utils/ElementUtils";
import TransformationBlockDTO from "../../../data/dto/TransformationBlockDTO";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select'
import {KUWALA_LIGHT_PURPLE, KUWALA_PURPLE} from "../../../constants/styling";

export default ({isOpen}) => {
    const {toggleTransformationConfigModal} = useStoreActions(actions => actions.common);
    const {updateTransformationBlock} = useStoreActions(actions => actions.canvas);
    const {openTransformationConfigModal} = useStoreState(state => state.common);
    const {selectedElement, elements} = useStoreState(state => state.canvas);
    const [transformationBlockName, setTransformationBlockName] = useState('-');
    const [showToolTip, setShowToolTip] = useState(false);
    const [isTransformationBlockSaveLoading, setIsTransformationBlockSaveLoading] = useState(false);
    const [submitData, setSubmitData] = useState(null);

    useEffect( ()=> {
        initNodeName()
    }, [selectedElement])

    const initNodeName = () => {
        if(selectedElement && selectedElement.type === TRANSFORMATION_BLOCK) {
            setTransformationBlockName(selectedElement.data.transformationBlock.name)
        }else {
            setTransformationBlockName('');
        }
    }

    const ConfigHeader = () => {
        const { values } = useFormikContext();
        if (!selectedElement) {
            return <></>
        } else {
            return (
                <div className={'flex flex-row px-6 py-2'}>
                    <div className={'flex flex-col items-center'}>
                        <div
                            className={'flex flex-col justify-center items-center bg-white rounded-xl drop-shadow-lg relative p-4 w-24 h-24'}
                        >
                            <Icon
                                icon={selectedElement.data.transformationCatalog.categoryIcon}
                                size={'lg'}
                                color={'kuwalaPurple'}
                            />
                            <span className={'mt-1 text-sm capitalize'}>{selectedElement.data.transformationCatalog.category}</span>
                        </div>
                    </div>

                    <div className={'flex flex-col ml-6 space-y-2 bottom-0 justify-end mb-2'}>
                        <span className={'px-3 py-1 bg-kuwala-light-purple text-kuwala-purple font-semibold rounded-lg w-52'}>
                            Transformation Block
                        </span>

                        <div className={'flex flex-row items-center'}>
                            <label className={'font-semibold'}>Name:</label>
                            <Field
                                type="text"
                                value={`${values.transformationBlockName}`}
                                name={`transformationBlockName`}
                                className={`
                                    form-control
                                    block
                                    w-full                                   
                                    ml-2
                                    px-2
                                    py-0.5
                                    text-base
                                    font-light
                                    text-gray-700
                                    bg-gray-100 bg-clip-padding
                                    border border-solid border-kuwala-purple
                                    rounded-lg
                                    transition
                                    ease-in-out
                                    m-0
                                    focus:text-gray-700 focus:bg-white focus:outline-none
                                `}
                            />
                        </div>
                    </div>
                </div>
            )
        }
    }

    const ConfigBody = React.memo(() => {
        const { values, submitForm, setFieldValue } = useFormikContext();
        if (!selectedElement) {
            return (
                <div>
                    Undefined transformation block, try to re open the configuration modal.
                </div>
            )
        } else {
            return (
                <div className={'flex flex-col flex-auto px-6 pt-2 pb-4 h-full overflow-y-auto w-full'}>
                    <div className={'flex flex-row bg-white border-2 border-kuwala-purple rounded-lg h-full w-full'}>
                        <div className={'flex flex-col px-6 py-6 w-full'}>
                            {renderConfigBodyHeader()}
                            {renderConfigBodyContent({values, setFieldValue})}
                        </div>
                    </div>
                </div>
            )
        }
    })

    const FormikWrapper = ({children}) => {
        let params = selectedElement.data.transformationCatalog.macroParameters.map((el) => {
                return {
                    ...el,
                    value: ''
                }
            });
        if(selectedElement.data.transformationBlock.isConfigured) {
            params = selectedElement.data.transformationBlock.macroParameters;
        }
        
        let isMaterializeTable = selectedElement.data.transformationBlock.isMaterializeTable;
        let tfBlockName = transformationBlockName;

        if(submitData !== null) {
            params = submitData.parameters;
            isMaterializeTable = submitData.isMaterializeTable;
            tfBlockName = submitData.transformationBlockName;
        }

        return (
            <Formik
                initialValues={{
                    parameters: params,
                    isMaterializeTable: isMaterializeTable,
                    transformationBlockName: tfBlockName,
                }}
                onSubmit={async (values)=>{
                    setSubmitData(values);
                    console.log(values);
                    await upsertTransformationBlocks({values});
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

    const renderConfigBodyHeader = () => {
        return (
            <div className={'flex flex-col'}>
                <div className={'flex flex-row items-center space-x-4'}>
                    <Icon
                        size={'sm'}
                        color={'kuwalaPurple'}
                        icon={selectedElement.data.transformationCatalog.icon}
                    />
                    <span className={'text-lg text-kuwala-purple font-semibold'}>
                        {selectedElement.data.transformationCatalog.name}
                    </span>
                </div>
                <span className={'mt-2 text-md'}>
                    {selectedElement.data.transformationCatalog.description}
                </span>
            </div>
        )
    }

    const renderConfigBodyContent = ({values, setFieldValue}) => {
        return (
            <div className={'flex flex-row mt-4 w-full'}>
                <div className={'flex flex-col bg-white w-7/12 h-full'}>
                    <span className={'font-semibold mb-6'}>
                        Parameters
                    </span>
                    {renderConfigBodyParameters({values, setFieldValue})}
                </div>
                <div className={'flex flex-col bg-white w-5/12 h-full'}>
                    <span className={'font-semibold mb-6'}>
                        Settings
                    </span>
                    {renderConfigBodySettings({values, setFieldValue})}
                </div>
            </div>
        )
    }

    const renderConfigBodyParameters = ({values, setFieldValue}) => {
        return (
            <div className={'flex flex-col'}>
                {renderDataSourceConfigForm({values, setFieldValue})}
            </div>
        )
    }

    const renderConfigBodySettings = ({values, setFieldValue}) => {
        return (
            <div className={'flex flex-row items-center space-x-4'}>
                <div className={'w-8 h-8 bg-white border-2 border-kuwala-purple rounded-full cursor-pointer flex flex-col items-center justify-center'}
                     onClick={
                         () => setFieldValue('isMaterializeTable', !values.isMaterializeTable)
                     }
                >
                    {
                        values.isMaterializeTable ? (
                            <Icon
                                icon={'check'}
                                color={'kuwalaPurple'}
                                size={'fill'}
                            />
                        ) : undefined
                    }
                </div>
                <span className={'text-md'}>
                    Save as Table
                </span>
                <div
                    className={'w-7 h-7 bg-kuwala-light-purple rounded-full cursor-pointer flex flex-col items-center justify-center relative'}
                    onMouseEnter={e => {
                        setSubmitData(values);
                        setShowToolTip(true);
                    }}
                    onMouseLeave={e => {
                        setSubmitData(values);
                        setShowToolTip(false);
                    }}
                >
                    <Icon
                        icon={'question'}
                        color={'kuwalaPurple'}
                        size={'fill'}
                    />
                    <div
                        className={`absolute rounded-lg mt-40 w-72 text-sm border border-kuwala-light-purple bg-white-100 px-4 py-2 ${showToolTip ? 'block' : 'hidden'}`}
                    >
                        <p>You can save the result of this</p>
                        <p>transformation as a table in your data</p>
                        <p>warehouse. It takes up storage but</p>
                        <p>improves the query performance of</p>
                        <p>subsequent transformations.</p>
                    </div>
                </div>
            </div>
        )
    }

    const renderDataSourceConfigForm = ({values, setFieldValue}) => {
        if(!selectedElement || !values.parameters) {
            return (
                <div>
                    Undefined transformation block, try re open the configuration.
                </div>
            )
        }else {
            return (
                <Form>
                    <FieldArray
                        name={'parameters'}
                        render={() => renderFormBodyContainer(values, setFieldValue)}
                    />
                </Form>
            )
        }
    }

    const renderFormBodyContainer = (values, setFieldValue) => {
        return (
            <div className={'flex flex-col bg-white rounded-lg h-full space-y-8'}>
                {values.parameters.map((parameter,index) => renderFormByType({parameter, index, values, setFieldValue}))}
            </div>
        );
    }

    const renderFormByType = ({parameter, index, values, setFieldValue}) => {
        let formBody;
        let block = null;
        let type = parameter.type;
        if (parameter.options) type = 'options';
        if (parameter.id === 'column') type = 'column';
        if (parameter.id === 'columns') type = 'columns';
        if (parameter.id === 'left_block') type = 'left_block';
        if (parameter.id === 'right_block') type = 'right_block';
        if (parameter.id === 'column_left') type = 'column_left';
        if (parameter.id === 'column_right') type = 'column_right';

        switch (type) {
            case 'column':
                block = getElementById(
                    elements,
                    selectedElement.data.transformationBlock.connectedSourceNodeIds[0]
                );

                if(!block) {
                    formBody = defaultEmptyForm('Failed to get data block');
                    break;
                }

                let columnOptions = [];
                if(block.type === DATA_BLOCK) {
                    columnOptions = block.data.dataBlock.columns
                }

                formBody = (
                    <Field
                        as={'select'}
                        component={'select'}
                        key={parameter.id}
                        name={`parameters[${index}].value`}
                        className={Classes.FieldContainer}
                    >
                        {renderNullOption('Select a column')}
                        {columnOptions.map(el =>
                            <option
                                className={Classes.DropdownItem}
                                value={el}>{el}
                            </option>
                        )}
                    </Field>
                )
                break;
            case 'columns':
                const columnsBlock = getDataBlockByElementId({
                    elements: elements,
                    elementId: selectedElement.data.transformationBlock.connectedSourceNodeIds[0]
                });

                if(!columnsBlock) {
                    formBody = defaultEmptyForm('Failed to get data block');
                    break;
                }

                const options = columnsBlock.columns.map(el => ({
                    value: el,
                    label: el,
                }));

                const customStyles = {
                    control: styles => ({
                        ...styles,
                        backgroundColor: `#FFF`,
                        width: '18rem',
                        borderRadius: '0.5rem',
                        borderColor: KUWALA_PURPLE,
                        boxShadow: 'none',
                        "&:hover": {
                            borderColor: KUWALA_PURPLE,
                        },
                    }),
                    option: (styles) => {
                        return {
                            ...styles,
                            backgroundColor: `#FFF`,
                            "&:hover": {
                                backgroundColor: KUWALA_LIGHT_PURPLE,
                            },
                            color: KUWALA_PURPLE,
                        };
                    },
                };

                formBody = (
                    <Select
                        key={parameter.id}
                        options={options}
                        value={options.filter(el => values.parameters[index].value.includes(el.value))}
                        name={`parameters[${index}].value`}
                        onChange={(e) => {
                            setFieldValue(`parameters[${index}].value`, e.map(el => el.value))
                        }}
                        isMulti
                        styles={customStyles}
                    />
                )
                break;
            case 'left_block':
            case 'right_block':
                const listOfBlocks = selectedElement.data.transformationBlock.connectedSourceNodeIds.map(el => getDataBlockByElementId({
                    elements,
                    elementId: el
                }));

                formBody = <Field
                    as={'select'}
                    component={'select'}
                    key={parameter.id}
                    name={`parameters[${index}].value`}
                    className={Classes.FieldContainer}
                >
                    {renderNullOption('Select a block')}
                    {listOfBlocks.map(el => {
                        return <option
                            className={Classes.DropdownItem}
                            value={el.dataBlockEntityId}>{el.name}
                        </option>
                    })}
                </Field>

                break;
            case 'column_left':
            case 'column_right':
                let elId;
                if(type === "column_left") {
                    elId = values.parameters.find((el) => el.id === 'left_block')
                } else {
                    elId = values.parameters.find((el) => el.id === 'right_block')
                }

                if (!elId.value || elId.value === '') {
                    formBody = defaultEmptyForm(`Please select the block first`, `parameters[${index}].value`);
                    break;
                }

                block = getDataBlockByDataBlockEntityId({
                    elements: elements,
                    dataBlockEntityId: elId.value
                });

                if(!block) {
                    formBody = defaultEmptyForm('Failed to get data blocks', `parameters[${index}].value`);
                    break;
                }

                formBody = <Field
                    as={'select'}
                    component={'select'}
                    key={parameter.id}
                    name={`parameters[${index}].value`}
                    className={Classes.FieldContainer}
                >
                    {renderNullOption('Select a column')}
                    {block.data.dataBlock.columns.map(el =>
                        <option
                            className={Classes.DropdownItem}
                            value={el}>{el}</option>
                    )}
                </Field>

                break;
            case 'text':
                formBody = (
                    <Field
                        name={`parameters[${index}].value`}
                        type={'text'}
                        className={Classes.TextField}
                        key={parameter.id}
                        placeholder={`Enter ${parameter.name}`}
                    />
                )
                break;
            case 'options':
                formBody = (
                    <div className={'dropdown relative'}>
                        <Field
                            as={'select'}
                            component={'select'}
                            key={parameter.id}
                            name={`parameters[${index}].value`}
                            className={Classes.FieldContainer}
                        >
                            {renderNullOption('Select an Option')}
                            {parameter.options.map(el =>
                                <option
                                    className={Classes.DropdownItem}
                                    value={el.id}
                                >
                                    {el.name}
                                </option>
                            )}
                        </Field>
                    </div>
                )
                break;
            case 'date':
                formBody = (
                        <div>
                            <DatePicker
                                name={`parameters[${index}].value`}
                                values={values.parameters[index].value}
                                selected={values.parameters[index].value}
                                onChange={(val) => {
                                    setFieldValue(`parameters[${index}].value`, val);
                                }}
                                className={Classes.FieldContainer}
                                style={{
                                    focusVisible: 'none',
                                }}
                            />
                        </div>
                )
                break;
            default:
                formBody = (
                    <Field
                        name={`parameters[${index}].value`}
                        type={'text'}
                        className={Classes.TextField}
                        placeholder={`Enter ${parameter.name}`}
                    />
                )
                break;
        }

        return (
            <div className={'flex flex-row h-full w-full items-center space-x-4'}
                 key={index}
            >
                <span className={'w-24 mr-6'}>
                    {parameter.name}
                </span>
                {formBody}
            </div>
        );
    };

    const toggleConfigModalWrapper = () => {
        toggleTransformationConfigModal();
        setSubmitData(null);
    }

    const ConfigFooter = () => {
        const { submitForm } = useFormikContext();
        return (
            <div className={'flex flex-row justify-between px-6 pb-4'}>
                <Button
                    onClick={toggleConfigModalWrapper}
                    text={'Back'}
                    color={'kuwalaPurple'}
                />
                <Button
                    type={'submit'}
                    loading={isTransformationBlockSaveLoading}
                    disabled={isTransformationBlockSaveLoading}
                    text={'Save'}
                    color={'kuwalaPurple'}
                    onClick={submitForm}
                />
            </div>
        )
    }

    const upsertTransformationBlocks = async ({values}) => {
        setIsTransformationBlockSaveLoading(true);
        const connectedElements = getElementByIds(elements, selectedElement.data.transformationBlock.connectedSourceNodeIds);
        const connectedBlocks = connectedElements.map((el) => getEntityElementEntityBlockId(el));

        if(!selectedElement.data.transformationBlock.transformationBlockEntityId) {
            const data = {
                transformation_catalog_item_id: selectedElement.data.transformationCatalog.id,
                input_block_ids: connectedBlocks,
                macro_parameters: values.parameters.map((el) => {
                    if (el.type === 'list[text]' && el.id !== 'columns') {
                        return {
                            id: el.id,
                            value: el.value.split(',').map(el => el.trim())
                        }
                    }
                    return {
                        id: el.id,
                        value: el.value
                    }
                }),
                name: values.transformationBlockName,
                materialize_as_table: values.isMaterializeTable
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
                        isMaterializeTable: values.isMaterializeTable,
                        columns: res.data.columns
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
        }else {
            try {
                const data = {
                    columns: values.parameters.filter(el => ['column', 'columns', 'column_right', 'column_left'].includes(el.id)).map(el => {
                        return el.value
                    }),
                }
                const res = await updateTransformationBlockColumns({
                    transformationBlockId: selectedElement.data.transformationBlock.transformationBlockEntityId,
                    data: data
                });
                if(res.status === 200) {
                    const dto = new TransformationBlockDTO({
                        transformationCatalog: selectedElement.data.transformationCatalog,
                        name: values.transformationBlockName,
                        connectedSourceNodeIds: selectedElement.data.transformationBlock.connectedSourceNodeIds,
                        transformationBlockId: selectedElement.data.transformationBlock.transformationBlockId,
                        connectedTargetNodeIds: selectedElement.data.transformationBlock.connectedTargetNodeIds,
                        isConfigured: true,
                        macroParameters: values.parameters.map((el) => {
                            if(['column', 'columns', 'column_right', 'column_left'].includes(el.id)) {
                                return {
                                    id: el.id,
                                    name: el.name,
                                    value: data.columns
                                }
                            }else {
                                return {
                                    id: el.id,
                                    name: el.name,
                                    value: el.value
                                }
                            }
                        }),
                        transformationCatalogItemId: selectedElement.data.transformationBlock.transformationCatalogItemId,
                        transformationBlockEntityId: selectedElement.data.transformationBlock.transformationBlockEntityId,
                        isMaterializeTable: selectedElement.data.transformationBlock.isMaterializeTable,
                    })
                    updateTransformationBlock(dto);
                    toggleTransformationConfigModal();
                    setTransformationBlockName(values.transformationBlockName);
                }
            } catch(e){
                alert('Failed to update transformation block')
            } finally {
                setIsTransformationBlockSaveLoading(false);
            }
        }
    }


    const defaultEmptyForm = (placeHolder, name) => {
        return <Field
            type={'text'}
            className={Classes.DisabledTextField}
            placeholder={placeHolder}
            disabled={true}
            name={'empty'}
        />
    }

    const renderNullOption = (optionText) => {
        return <option className={Classes.DropdownItem} value={null}>
            {optionText}
        </option>
    }


    return (
        <Modal
            isOpen={isOpen}
            closeModalAction={toggleConfigModalWrapper}
        >
            {selectedElement && selectedElement.type === TRANSFORMATION_BLOCK ? (
                <>
                    <FormikWrapper>
                        <ConfigHeader/>
                        <ConfigBody/>
                        <ConfigFooter/>
                    </FormikWrapper>
                </>
            ) : <></>}
        </Modal>
    )
}