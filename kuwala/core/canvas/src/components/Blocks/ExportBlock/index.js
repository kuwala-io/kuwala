import React, {useEffect, useState} from 'react';
import {useStoreActions, useStoreState} from "easy-peasy";
import Block from "../../Common/Block";
import {deleteTransformationBlock} from "../../../api/TransformationBlock";
import {triggerExportBlock} from "../../../api/ExportBlock";

const ExportBlock = ({data, id}) => {
    const {selectedElement} = useStoreState(({ canvas }) => canvas);
    const { toggleExportConfigModal } = useStoreActions(({ common }) => common);
    const {
        setSelectedElementByExportBlockId,
    } = useStoreActions(({ canvas }) => canvas);
    const [exportLoading, setExportLoading] = useState(false);

    const openConfigModal = () => {
        setSelectedElementByExportBlockId(data.exportBlock.exportBlockId)
        toggleExportConfigModal();
    }

    // TODO: Create export action by export method
    const triggerExport = async () => {
        if (selectedElement) {
            setExportLoading(true);
            const res = await triggerExportBlock({
                exportBlockId: selectedElement.data.exportBlock.exportBlockEntityId
            });

            let file_name = selectedElement.data.exportBlock.macroParameters.find(el => el.id === 'file_name').value;
            file_name = file_name.replace(/\.[^/.]+$/, "") // Remove extension

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `${file_name}.csv`
            );
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            setTimeout(() => {
                setExportLoading(false);
            }, 5000)
        }
    }

    return (
        <Block
            selected={selectedElement && selectedElement.id === id}
            leftHandleActive={true}
            rightHandleActive={false}
            blockColor={'kuwalaRed'}
            hideLeftHandle={false}
            hideRightHandle={true}
            // onDelete={onDelete}
            primaryButtonDisabled={!(data.exportBlock.connectedSourceNodeIds.length >= data.exportCatalogItem.minNumberOfInputBlocks) || exportLoading}
            primaryButtonOnClick={openConfigModal}
            secondaryButtonDisabled={!data.exportBlock.isConfigured || exportLoading}
            secondaryButtonOnClick={triggerExport}
            secondaryButtonText={"Export"}
            title={data.exportBlock.name}
            data={data}
            icon={data.exportBlock.exportCatalogItem.icon}
        />
    )
}

export default ExportBlock;