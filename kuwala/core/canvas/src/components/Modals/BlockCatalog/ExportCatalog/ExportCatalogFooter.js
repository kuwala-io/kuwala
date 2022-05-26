import Classes from "../CommonBlockCatalogModalStyle";
import Button from "../../../Common/Button";
import React from "react";

const ExportCatalogFooter = ({toggleBlockCatalogModal, selectedCatalogOption}) => {
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

export default ExportCatalogFooter;