import Classes from "../CommonBlockCatalogModalStyle";
import Button from "../../../Common/Button";
import React from "react";

const ExportCatalogFooter = ({toggleBlockCatalogModal, addToCanvas, selectedCatalogOption}) => {
    return (
        <div className={Classes.ModalFooterContainer}>
            <Button
                onClick={toggleBlockCatalogModal}
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

export default ExportCatalogFooter;