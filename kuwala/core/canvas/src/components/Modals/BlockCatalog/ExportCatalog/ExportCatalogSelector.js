import Button from "../../../Common/Button";
import Classes from "../CommonBlockCatalogModalStyle";
import React from "react";

const ExportCatalogSelector = ({setSelectedCatalogOption, setSelectedExportIndex, selectedExportIndex, catalogCategories}) => {
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
                color={'kuwalaPurple'}
                icon={catalogItem.icon}
                text={catalogItem.name}
            />
        )
    }

    return (
        <div className={Classes.CatalogContainer}>
            <div className={Classes.CatalogListContainer}>
                {catalogCategories.map(renderCatalogItem)}
            </div>
        </div>
    )
}

export default ExportCatalogSelector;
