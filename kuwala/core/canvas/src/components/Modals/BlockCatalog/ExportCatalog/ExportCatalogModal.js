import React, {Fragment, useEffect, useState} from "react";
import {useStoreActions} from "easy-peasy";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Button from "../../../Common/Button";
import Classes from "../CommonBlockCatalogModalStyle";
import ExportCatalogDTO from "../../../../data/dto/ExportCatalogDTO";
import {getAllExportCatalogCategories, getAllItemsInExportCategory} from "../../../../api/ExportCatalog";

export default () => {
    const { toggleBlockCatalogModal } = useStoreActions(actions => actions.common);
    const [selectedExportIndex, setSelectedExportIndex] = useState(null);
    const [catalogCategories, setCatalogCategories] = useState([]);
    const [catalogOptions, setCatalogOptions] = useState([]);
    const [selectedCatalogOption, setSelectedCatalogOption] = useState(null);

    useEffect(() => {
        initExportCatalogs().then(null);
    }, [])

    useEffect(()=> {
        if(catalogCategories.length) {
            const category = catalogCategories[selectedExportIndex]
            fetchCatalogBodyItems(category).then(null);
        }
    }, [selectedExportIndex])

    const initExportCatalogs = async () => {
        try{
            const res = await getAllExportCatalogCategories();
            if(res.status === 200){
                setCatalogCategories(res.data);
            } else {
                setCatalogCategories([]);
            }
        }catch(e) {
            console.error('Failed to get export catalog', e);
        }
    }

    const fetchCatalogBodyItems = async (category) => {
        try{
            const categoryId = category.id;
            const res = await getAllItemsInExportCategory(categoryId);
            if(res.status === 200){
                catalogOptionsIntoDTO(res.data, category);
            } else {
                setCatalogOptions([]);
            }
        }catch(e) {
            console.error('Failed to get export catalog', e);
        }
    }

    const catalogOptionsIntoDTO = (apiResponse, category) => {
        let tempOptions = [];
        apiResponse.forEach((el) => {
            const tfCatalogDTO = new ExportCatalogDTO({
                id: el.id,
                category: el.category,
                categoryIcon: category.icon,
                name: el.name,
                icon: el.icon,
                description: el.description,
                minNumberOfInputBlocks: el.min_number_of_input_blocks,
                maxNumberOfInputBlocks: el.max_number_of_input_blocks,
                macroParameters: el.macro_parameters,
            });
            tempOptions.push(tfCatalogDTO);
        });
        setCatalogOptions(tempOptions);
    }

    const CatalogSelector = () => {
        return (
            <div className={Classes.CatalogContainer}>
                <div className={Classes.CatalogListContainer}>
                    {renderCatalogList()}
                </div>
            </div>
        )
    }

    const renderCatalogList = () => {
        if(catalogCategories.length) {
            return catalogCategories.map(renderCatalogItem)
        }
    }

    const renderCatalogItem = (catalogItem, index) => {
        return (
            <Button
                key={index}
                onClick={()=>{
                    setSelectedCatalogOption(null);
                    setSelectedExportIndex(index)
                }}
                selected={selectedExportIndex === index}
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
                    selectedExportIndex !== null
                        ?
                        <SelectedExportCatalog/>
                        :
                        <div className={Classes.CatalogBodyAlertText}>
                            <p>To pick an export block,</p>
                            <p>select an export <span className={'text-kuwala-red'}>category</span> first</p>
                        </div>
                }
            </div>
        )
    }

    const SelectedExportCatalog = () => {
        if (selectedExportIndex === null || catalogOptions.length === 0) {
            return (
                <div>
                    There are currently no <span className={'text-kuwala-red'}>blocks</span> available in this category.
                </div>
            )
        } else {
            return (
                <div className={Classes.SelectedBlockCatalogContainer}>
                    <div className={Classes.BlockCatalogOptionsContainer}>
                        {renderOptions(catalogOptions)}
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

    const renderOptions = (options) => {
        return options.map(renderOptionItem)
    }

    const renderOptionItem = (optionItem, index) => {
        return (
            <Button
                key={index}
                solid={false}
                color={'kuwalaRed'}
                onClick={()=>{
                    setSelectedCatalogOption(index)
                }}
                selected={selectedCatalogOption === index}
                icon={optionItem.icon}
                text={optionItem.name}
            />
        )
    }

    const renderSelectedOptionDetails = () => {
        if(selectedCatalogOption === null){
            return (
                <div className={Classes.OptionDetailsAlertText}>
                    <p>To see the <span className={'text-kuwala-red'}>details</span> of an export block,</p>
                    <p>select one from the left</p>
                </div>
            )
        } else {
            const optionItem = catalogOptions[selectedCatalogOption];
            return (
                <div className={Classes.ExportOptionDetailsContent}>
                    <div className={'text-kuwala-red space-x-4'}>
                        <FontAwesomeIcon icon={optionItem.icon}/>
                        <span className={'font-semibold'}>
                            {optionItem.name}
                        </span>
                    </div>
                    <p className={'mt-2'}>
                        {optionItem.description}
                    </p>

                    <div className={Classes.OptionDetailsParameterAndExample}>
                        <div className={Classes.OptionDetailsParameterContainer}>
                            <p>Parameters</p>
                            {optionItem.macroParameters.map((el, i) => <li key={i}>{el.name}</li>)}
                        </div>
                    </div>
                </div>
            )
        }
    }

    const CatalogFooter = () => {
        return (
            <div className={Classes.ModalFooterContainer}>
                <Button
                    onClick={toggleBlockCatalogModal}
                    text={'Back'}
                />
                <Button
                    onClick={() => {
                        alert('Add Export block to canvas')
                    }}
                    text={'Add to canvas'}
                    disabled={selectedCatalogOption === null}
                />
            </div>
        )
    }

    return (
        <Fragment>
            <CatalogSelector/>
            <CatalogBody/>
            <CatalogFooter/>
        </Fragment>
    )
}