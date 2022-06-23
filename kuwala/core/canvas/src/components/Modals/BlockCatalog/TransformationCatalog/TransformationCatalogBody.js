import Classes from "../CommonBlockCatalogModalStyle";
import React from "react";
import Button from "../../../Common/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import cn from "classnames";
import {getDataDictionary} from "../../../../utils/SchemaUtils";
import {Table} from "../../../Common";

const TransformationCatalogBody = ({selectedTransformationIndex, catalogOptions, setSelectedCatalogOption, selectedCatalogOption}) => {

    const ExampleTable = ({columns, rows}) => {
        const populatedColumns = columns.map((el)=>{
            return {
                Header: el,
                accessor: el,
            }
        });
        const populatedRows = getDataDictionary(rows, columns);

        return (
            <Table data={populatedRows} columns={populatedColumns} />
        )
    }

    const SelectedTransformationCatalog = () => {
        if (selectedTransformationIndex === null || catalogOptions.length === 0) {
            return (
                <div>
                    There are currently no <span className={'text-kuwala-red'}>blocks</span> available in this category.
                </div>
            )
        } else {
            return (
                <div className={Classes.SelectedBlockCatalogContainer}>
                    <div className={Classes.BlockCatalogOptionsContainer}>
                        {renderTransformationOptions(catalogOptions)}
                    </div>
                    <div className={Classes.SelectedOptionDetailsContainer}>
                        <div className={Classes.OptionDetailsContainer}>
                            {renderSelectedOptionDetails()}
                        </div>
                    </div>
                </div>
            )
        }
    }

    const renderTransformationOptions = (options) => {
        return options.map(renderOptionItem)
    }

    const renderSelectedOptionDetails = () => {
        if (selectedCatalogOption === null){
            return (
                <div className={Classes.OptionDetailsAlertText}>
                    <p>To see the <span className={'text-kuwala-purple'}>details</span> of a transformation block,</p>
                    <p>select one from the left</p>
                </div>
            )
        } else {
            const optionItem = catalogOptions[selectedCatalogOption];

            return (
                <div className={Classes.TransformationOptionDetailsContent}>
                    <div className={'text-kuwala-purple space-x-4'}>
                        <FontAwesomeIcon icon={optionItem.icon} />

                        <span className={'font-semibold'}>
                            {optionItem.name}
                        </span>
                    </div>
                    <p className={'mt-2'}>
                        {optionItem.description}
                    </p>

                    {renderColumnType(
                        optionItem.requiredColumnTypes,
                        optionItem.optionalColumnTypes)
                    }

                    <div className={Classes.OptionDetailsParameterAndExample}>
                        <div className={Classes.OptionDetailsParameterContainer}>
                            <p>Parameters</p>
                            {optionItem.macroParameters.map((el, i) => <li key={i}>{el.name}</li>)}
                        </div>
                        <div className={Classes.OptionDetailsExampleContainer}>
                            {renderExampleTableWrapper(optionItem)}
                        </div>
                    </div>
                </div>
            )
        }
    }

    const renderColumnType = (requiredColumnTypesData, optionalColumnTypesData) => {
        let requiredColumnTypes, optionalColumnTypes;

        if (requiredColumnTypesData.length) {
            requiredColumnTypes = (
                <div className={cn(Classes.RequiredColumnBase, 'mt-6')}>
                    <span>
                        Required column types:
                    </span>

                    {renderBadgeList(requiredColumnTypesData)}
                </div>
            )
        }

        if (optionalColumnTypesData.length) {
            optionalColumnTypes = (
                <div className={cn(Classes.RequiredColumnBase, 'mt-2')}>
                    <span>
                        Optional column types:
                    </span>

                    {renderBadgeList(optionalColumnTypesData)}
                </div>
            )
        }

        return (
            <div>
                {requiredColumnTypes}
                {optionalColumnTypes}
            </div>
        )

    }

    const renderExampleTableWrapper = (optionItem) => {
        return (
            <div className={'flex flex-col'}>
                {renderExampleTable({
                    examplesData: optionItem.examplesBefore,
                    text: 'Before'
                })}
                {renderExampleTable({
                    examplesData: optionItem.examplesAfter,
                    text: 'After'
                })}
            </div>
        )
    }

    const renderExampleTable = ({examplesData, text}) => {
        return (
            <div className={'mb-2'}>
                <span className={cn(Classes.ExampleBase,'my-2')}>
                   {text}
                </span>
                {examplesData.map((el, i) => {
                    return (
                        <div key={i} className={'flex flex-col mb-2'}>
                            <ExampleTable
                                columns={el.columns}
                                rows={el.rows}
                            />
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderBadgeList = (badgeStringList) => {
        if(!badgeStringList || !badgeStringList.length) return
        return badgeStringList.map((el, i) => {
            return (
                <div key={i} className={Classes.BadgeBase}>
                    {el}
                </div>
            )
        })
    }

    const renderOptionItem = (optionItem, index) => {
        return (
            <Button
                key={index}
                alignment={'start'}
                solid={false}
                color={'kuwalaPurple'}
                onClick={()=>{
                    setSelectedCatalogOption(index)
                }}
                selected={selectedCatalogOption === index}
                icon={optionItem.icon}
                text={optionItem.name}
            />
        )
    }

    return (
        <div className={Classes.CatalogBodyContainer}>
            {
                selectedTransformationIndex !== null
                    ?
                    <SelectedTransformationCatalog />
                    :
                    <div className={Classes.CatalogBodyAlertText}>
                        <p>To pick a transformation block,</p>
                        <p>select a transformation <span className={'text-kuwala-red'}>category</span> first</p>
                    </div>
            }
        </div>
    )
}

export default TransformationCatalogBody;