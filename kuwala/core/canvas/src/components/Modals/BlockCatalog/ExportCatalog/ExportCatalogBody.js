import Classes from "../CommonBlockCatalogModalStyle";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Button from "../../../Common/Button";

const ExportCatalogBody = ({selectedExportIndex, catalogOptions, selectedCatalogOption, setSelectedCatalogOption}) => {
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

    const renderOptions = (options) => {
        return options.map(renderOptionItem)
    }

    const renderOptionItem = (optionItem, index) => {
        return (
            <Button
                key={index}
                solid={false}
                alignment={'start'}
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

export default ExportCatalogBody;