import React, {useCallback, useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {
    getAllTransformationCatalogCategories,
    getAllItemsInCategory
} from "../../../api/TransformationCatalog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShuffle} from "@fortawesome/free-solid-svg-icons";
import ExampleTable from './ExampleTable';
import "./transformation-example-table.css";
import Modal from "../../Common/Modal";
import Button from "../../Common/Button";
import Classes from "./TransformationCatalogStyle";
import cn from "classnames";
import TransformationBlockDTO from "../../../data/dto/TransformationBlockDTO";
import TransformationCatalogDTO from "../../../data/dto/TransformationCatalogDTO";
import {v4} from "uuid";

const TransformationCatalogModal = ({isOpen}) => {
    const { elements } = useStoreState(({ canvas }) => canvas);
    const { addNode, setElements } = useStoreActions(({ canvas }) => canvas);
    const { toggleTransformationCatalogModal } = useStoreActions(({ common }) => common);
    const {
        addTransformationBlock,
        convertTransformationBlockIntoElement
    } = useStoreActions(({ transformationBlocks }) => transformationBlocks);
    const [selectedTransformationIndex, setSelectedTransformationIndex] = useState(null);
    const [catalogCategories, setCatalogCategories] = useState([]);
    const [catalogOptions, setCatalogOptions] = useState([]);
    const [selectedCatalogOption, setSelectedCatalogOption] = useState(null);
    const fetchCatalogBodyItems = useCallback(async (category) => {
        try {
            const transformationId = category.id;
            const res = await getAllItemsInCategory(transformationId);

            if (res.status === 200){
                catalogOptionsIntoDTO(res.data, category);
            } else {
                setCatalogOptions([]);
            }
        } catch (e) {
            console.error('Failed to get transformation catalog', e);
        }
    }, []);

    useEffect(() => {
        initTransformationCatalog().then(null);
    }, [])

    useEffect(() => {
        if (catalogCategories.length && selectedTransformationIndex !== null) {
            const category = catalogCategories[selectedTransformationIndex]

            fetchCatalogBodyItems(category).then(null);
        }
    }, [catalogCategories, fetchCatalogBodyItems, selectedTransformationIndex])

    const initTransformationCatalog = async () => {
        try {
            const res = await getAllTransformationCatalogCategories();
            
            if(res.status === 200){
                setCatalogCategories(res.data);
            } else {
                setCatalogCategories([]);
            }
        } catch(e) {
            console.error('Failed to get transformation catalog', e);
        }
    }

    const addToCanvas = async () => {
        const tfCatalogDTO = catalogOptions[selectedCatalogOption];

        const tfBlockDTO = new TransformationBlockDTO({
            transformationBlockId: v4(),
            transformationBlockEntityId: null,
            isConfigured: false,
            transformationCatalogItemId: tfCatalogDTO.id,
            transformationCatalogItem: tfCatalogDTO,
            inputBlockIds: null,
            macroParameters: null,
            name: tfCatalogDTO.name,
        });

        addTransformationBlock(tfBlockDTO);
        convertTransformationBlockIntoElement({ addNode, elements, setElements });
        toggleTransformationCatalogModal();
    }

    const catalogOptionsIntoDTO = (apiResponse, category) => {
        let tempOptions = [];
        apiResponse.forEach((el) => {
            const tfCatalogDTO = new TransformationCatalogDTO({
                id: el.id,
                category: el.category,
                categoryIcon: category.icon,
                name: el.name,
                icon: el.icon,
                description: el.description,
                requiredColumnTypes: el.required_column_types,
                optionalColumnTypes: el.optional_column_types,
                minNumberOfInputBlocks: el.min_number_of_input_blocks,
                maxNumberOfInputBlocks: el.max_number_of_input_blocks,
                macroParameters: el.macro_parameters,
                examplesAfter: el.examples_after,
                examplesBefore: el.examples_before,
            });
            tempOptions.push(tfCatalogDTO);
        });
        setCatalogOptions(tempOptions);
    }

    const CatalogSelector = () => {
        return (
            <div className={Classes.CatalogContainer}>
                <div className={Classes.CatalogContent}>
                    <FontAwesomeIcon
                        icon={faShuffle}
                        className={'h-6 w-6'}
                    />

                    <span className={'font-semibold'}>Transformation Blocks</span>
                </div>

                <div className={Classes.CatalogListContainer}>
                    {renderCatalogList()}
                </div>
            </div>
        )
    }

    const renderCatalogList = () => {
        if (catalogCategories.length) {
            return catalogCategories.map(renderCatalogItem)
        }
    }

    const renderCatalogItem = (catalogItem, index) => {
        return (
            <Button
                key={index}
                onClick={() => {
                    setSelectedCatalogOption(null);
                    setSelectedTransformationIndex(index)
                }}
                selected={selectedTransformationIndex === index}
                solid={false}
                color={'kuwalaRed'}
                icon={catalogItem.icon}
                text={catalogItem.name}
            />
        )
    }

    const CatalogBody = () => {
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

    const SelectedTransformationCatalog = () => {
        if (selectedTransformationIndex === null || catalogOptions.length === 0) {
            return (
                <div>
                    No <span className={'text-kuwala-red'}>transformation</span> options found.
                </div>
            )
        } else {
            return (
                <div className={Classes.SelectedTransformationContainer}>
                    <div className={Classes.TransformationOptionsContainer}>
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

    const renderOptionItem = (optionItem, index) => {
        return (
            <Button
                alignment={'start'}
                key={index}
                solid={false}
                color={'kuwalaPurple'}
                onClick={() => {
                    setSelectedCatalogOption(index)
                }}
                selected={selectedCatalogOption === index}
                icon={optionItem.icon}
                text={optionItem.name}
            />
        )
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
                <div className={Classes.OptionDetailsContent}>
                    <div className={'text-kuwala-purple space-x-4'}>
                        <FontAwesomeIcon icon={optionItem.icon} />

                        <span className={'font-semibold'}>
                            {optionItem.name}
                        </span>
                    </div>

                    <p className={'mt-2'}>
                        {optionItem.description}
                    </p>

                    {renderColumnTypes(optionItem.requiredColumnTypes, optionItem.optionalColumnTypes)}

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

    const renderColumnTypes = (requiredColumnTypesData, optionalColumnTypesData) => {
        let requiredColumnTypes, optionalColumnTypes;

        if (requiredColumnTypesData.length) {
            requiredColumnTypes = (
                <div className={cn(Classes.RequiredColumnBase, 'mt-6')}>
                    <span>
                        Required column types:
                    </span>

                    {renderBadgeList(requiredColumnTypesData)}
                </div>
            );
        }

        if (optionalColumnTypesData.length) {
            optionalColumnTypes = (
                <div className={cn(Classes.RequiredColumnBase, 'mt-2')}>
                    <span>
                        Optional column types:
                    </span>

                    {renderBadgeList(optionalColumnTypesData)}
                </div>
            );
        }

        return (
            <div>
                {requiredColumnTypes}
                {optionalColumnTypes}
            </div>
        );

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

    const renderExampleTable = ({ examplesData, text }) => {
        return (
            <div className={'mb-2'}>
                <span className={cn(Classes.ExampleBase,'my-2')}>
                   {text}
                </span>

                {examplesData.map((element, index) => {
                    return (
                        <div key={index} className={'flex flex-col mb-2'}>
                            <ExampleTable
                                columns={element.columns}
                                rows={element.rows}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    const renderBadgeList = (badgeStringList) => {
        if (!badgeStringList || !badgeStringList.length) return

        return badgeStringList.map((element, index) => {
            return (
                <div key={index} className={Classes.BadgeBase}>
                    {element}
                </div>
            )
        })
    }

    const CatalogFooter = () => {
        return (
            <div className={Classes.ModalFooterContainer}>
                <Button
                    onClick={toggleTransformationCatalogModal}
                    text={'Back'}
                />

                <Button
                    onClick={addToCanvas}
                    text={'Add to canvas'}
                    disabled={selectedCatalogOption === null}
                />
            </div>
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            closeModalAction={toggleTransformationCatalogModal}
        >
            <CatalogSelector/>
            <CatalogBody/>
            <CatalogFooter/>
        </Modal>
    )
}

export default TransformationCatalogModal;
