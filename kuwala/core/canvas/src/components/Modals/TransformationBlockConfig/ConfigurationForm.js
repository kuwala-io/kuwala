import {getElementById} from "../../../utils/ElementUtils";
import {DATA_BLOCK, TRANSFORMATION_BLOCK} from "../../../constants/nodeTypes";
import {Field, FieldArray, Form} from "formik";
import Classes from "./TransformationBlockConfigModalStyle";
import {KUWALA_LIGHT_PURPLE, KUWALA_PURPLE} from "../../../constants/styling";
import Select from "react-select";
import {getBlockByEntityId} from "../../../utils/BlockUtils";
import CloseButton from "../../Common/CloseButton";
import Button from "../../Common/Button";
import DatePicker from "react-datepicker";
import React from "react";

const ConfigurationForm = ({ elements, selectedElement, setFieldValue, values }) => {
    const renderNullOption = (optionText) => {
        return <option className={Classes.DropdownItem} value={null}>
            {optionText}
        </option>
    }

    const renderEmptyField = (placeHolder) => {
        return <Field
            type={'text'}
            className={Classes.DisabledTextField}
            placeholder={placeHolder}
            disabled={true}
            name={'empty'}
        />
    }

    const renderFormByType = ({ index, parameter, setFieldValue, values}) => {
        let formBody;
        let options;
        let type = parameter.type;
        if (parameter.options) type = 'options';
        if (parameter.id === 'column') type = parameter.id;
        if (parameter.id === 'columns') type = parameter.id;
        if (parameter.id === 'group_by_columns') type = parameter.id;
        if (parameter.id === 'left_block') type = parameter.id;
        if (parameter.id === 'right_block') type = parameter.id;
        if (parameter.id === 'column_left') type = parameter.id;
        if (parameter.id === 'column_right') type = parameter.id;
        if (parameter.id === 'dividend_column') type = parameter.id;
        if (parameter.id === 'divisor_column') type = parameter.id;
        if (parameter.id === 'aggregated_columns') type = parameter.id;

        const getColumnOptions = (id) => {
            const precedingBlock = getElementById(elements, id);

            if (!precedingBlock) {
                return null;
            }

            let columnOptions = [];

            if (precedingBlock.type === DATA_BLOCK) {
                columnOptions = precedingBlock.data.dataBlock.columns
            } else if (precedingBlock.type === TRANSFORMATION_BLOCK) {
                columnOptions = precedingBlock.data.transformationBlock.columns
            }

            return columnOptions
        }

        switch (type) {
            case 'column':
            case 'dividend_column':
            case 'divisor_column':
                options = getColumnOptions(selectedElement.data.transformationBlock.connectedSourceNodeIds[0])
                formBody = (
                    <Field
                        as={'select'}
                        component={'select'}
                        key={parameter.id}
                        name={`parameters[${index}].value`}
                        className={Classes.FieldContainer}
                    >
                        {renderNullOption('Select a column')}

                        {options.map(el =>
                            <option
                                className={Classes.DropdownItem}
                                value={el}>{el}
                            </option>
                        )}
                    </Field>
                )
                break;
            case 'columns':
            case 'group_by_columns':
                options = getColumnOptions(selectedElement.data.transformationBlock.connectedSourceNodeIds[0]).map(el => ({
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
                const listOfBlocks = selectedElement.data.transformationBlock.connectedSourceNodeIds.map(el => getElementById(elements, el));

                formBody = <Field
                    as={'select'}
                    component={'select'}
                    key={parameter.id}
                    name={`parameters[${index}].value`}
                    className={Classes.FieldContainer}
                >
                    {renderNullOption('Select a block')}
                    {listOfBlocks.map(el => {
                        const blockId = el.type === DATA_BLOCK ? el.data.dataBlock.dataBlockEntityId : el.data.transformationBlock.transformationBlockEntityId
                        const blockName = el.type === DATA_BLOCK ? el.data.dataBlock.name : el.data.transformationBlock.name

                        return (
                            <option
                                className={Classes.DropdownItem}
                                value={blockId}
                            >
                                {blockName}
                            </option>
                        )
                    })}
                </Field>

                break;
            case 'column_left':
            case 'column_right':
                let entityId;

                if (type === "column_left") {
                    entityId = values.parameters.find((el) => el.id === 'left_block')
                } else {
                    entityId = values.parameters.find((el) => el.id === 'right_block')
                }

                if (!entityId.value || !entityId.value.length) {
                    formBody = renderEmptyField('Please select the block first');
                    break;
                }

                const block = getBlockByEntityId(elements, entityId.value);

                if (!block) {
                    formBody = renderEmptyField('Failed to get blocks');
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
                    {getColumnOptions(block.id).map(el =>
                        <option
                            className={Classes.DropdownItem}
                            value={el}
                        >
                            {el}
                        </option>
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
            case 'list[text]':
                formBody = (
                    <FieldArray name={`parameters[${index}].value`}>
                        {({ remove, push }) => (
                            <div>
                                {values.parameters[index].value.length > 0 &&
                                    values.parameters[index].value.map((value, i) => (
                                        <div key={i}>
                                            <div>
                                                <Field
                                                    name={`parameters[${index}].value.${i}`}
                                                    placeholder={`Enter ${parameter.name}`}
                                                    type="text"
                                                    className={`${Classes.TextField} mb-2`}
                                                />

                                                <CloseButton onClick={() => remove(i)} />
                                            </div>
                                        </div>
                                    ))
                                }

                                <Button onClick={() => push('')} text={'Add value'} color="kuwalaPurple" />
                            </div>
                        )}
                    </FieldArray>
                )
                break;
            case 'aggregated_columns':
                const columnOptions = getColumnOptions(selectedElement.data.transformationBlock.connectedSourceNodeIds[0])
                formBody = (
                    <FieldArray name={`parameters[${index}].value`}>
                        {({ remove, push }) => (
                            <div>
                                {values.parameters[index].value.length > 0 &&
                                    values.parameters[index].value.map((value, i) => (
                                        <div key={i}>
                                            <div className={Classes.ColumnAggregationContainer}>
                                                <div>
                                                    <Field
                                                        as={'select'}
                                                        component={'select'}
                                                        key={parameter.id}
                                                        name={`parameters[${index}].value.${i}.column`}
                                                        className={`${Classes.FieldContainer} mb-2`}
                                                    >
                                                        {renderNullOption('Select a column')}

                                                        {columnOptions.map(el =>
                                                            <option
                                                                className={Classes.DropdownItem}
                                                                value={el}
                                                            >
                                                                {el}
                                                            </option>
                                                        )}
                                                    </Field>

                                                    <Field
                                                        as={'select'}
                                                        component={'select'}
                                                        key={parameter.id}
                                                        name={`parameters[${index}].value.${i}.aggregation`}
                                                        className={Classes.FieldContainer}
                                                    >
                                                        {renderNullOption('Select an aggregation')}

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

                                                <CloseButton onClick={() => remove(i)} />
                                            </div>
                                        </div>
                                    ))
                                }

                                <Button onClick={() => push('')} text={'Add column'} color="kuwalaPurple" />
                            </div>
                        )}
                    </FieldArray>
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
                            dateFormat="yyyy-MM-dd"
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
            <div className={'flex flex-row h-full w-full space-x-4'} key={index}>
                <span className={'w-24 mr-6'}>
                    {parameter.name}
                </span>

                {formBody}
            </div>
        );
    };

    const renderFormBodyContainer = (values, setFieldValue) => {
        return (
            <div className={'flex flex-col bg-white rounded-lg h-full space-y-8'}>
                {values.parameters.map((parameter,index) => renderFormByType({parameter, index, values, setFieldValue}))}
            </div>
        );
    }

    return (
        <Form>
            <FieldArray
                name={'parameters'}
                render={() => renderFormBodyContainer(values, setFieldValue)}
            />
        </Form>
    )
}

export default ConfigurationForm;
