import Button from "../../../Common/Button";
import Classes from "../CommonBlockCatalogModalStyle";
import React from "react";

const TransformationCatalogSelector = ({setSelectedCatalogOption, setSelectedTransformationIndex, selectedTransformationIndex,catalogCategories}) => {
    const renderCatalogItem = (catalogItem, index) => {
        return (
            <Button
                key={index}
                onClick={() => {
                    setSelectedCatalogOption(null);
                    setSelectedTransformationIndex(index);
                }}
                selected={selectedTransformationIndex === index}
                solid={false}
                color={'kuwalaRed'}
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

export default TransformationCatalogSelector;