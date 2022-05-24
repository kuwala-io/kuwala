import React from 'react';
import {useStoreActions, useStoreState} from "easy-peasy";
import Block from "../../Common/Block";
import {deleteTransformationBlock} from "../../../api/TransformationBlock";

const TransformationBlock = ({data, id}) => {
    const {selectedElement} = useStoreState(({ canvas }) => canvas);
    const {toggleTransformationConfigModal} = useStoreActions(({ common }) => common);
    const {
        removeNodes,
        setSelectedElementByTransformationBlockId,
        toggleDataView
    } = useStoreActions(({ canvas }) => canvas);
    const {
        closeDialog,
        openDialog,
        setConfirmText,
        setDismissText,
        setLoading,
        setMessage,
        setOnConfirm,
        setRefreshBlocks,
        setTitle
    } = useStoreActions(({ confirmationDialog }) => confirmationDialog)
    const { removeDataBlock, updateDataBlock } = useStoreActions(({ dataBlocks }) => dataBlocks);
    const {
        removeTransformationBlock,
        updateTransformationBlock
    } = useStoreActions(({ transformationBlocks }) => transformationBlocks)

    const openConfigModal = () => {
        setSelectedElementByTransformationBlockId(data.transformationBlock.transformationBlockId)
        toggleTransformationConfigModal();
    }

    const onDelete = () => {
        if (data.transformationBlock.transformationBlockEntityId) {
            setConfirmText('Delete');
            setDismissText('Cancel');
            setMessage('Deleting this block will also delete all blocks that depend on it. Are you sure you want to continue?');
            setOnConfirm(onConfirm);
            setTitle('Attention!');
            openDialog();
        } else {
            removeNodes({
                nodesToRemove: [selectedElement],
                removeDataBlock,
                removeTransformationBlock,
                updateDataBlock,
                updateTransformationBlock
            });
        }
    }

    const onConfirm = async () => {
        setLoading(true);

        try {
            await deleteTransformationBlock({
                transformationBlockId: data.transformationBlock.transformationBlockEntityId
            });
            setRefreshBlocks(true);
            setLoading(false);
            closeDialog();
        } catch (error) {
            console.error(error);
            alert('Failed to delete transformation block')
        } finally {
            setLoading(false);
        }
    }

    return (
        <Block
            selected={selectedElement && selectedElement.id === id}
            leftHandleActive={true}
            rightHandleActive={data.transformationBlock.isConfigured}
            blockColor={'kuwalaPurple'}
            hideLeftHandle={false}
            hideRightHandle={false}
            onDelete={onDelete}
            primaryButtonDisabled={!(data.transformationBlock.connectedSourceNodeIds.length >= data.transformationCatalogItem.minNumberOfInputBlocks)}
            primaryButtonOnClick={openConfigModal}
            secondaryButtonDisabled={!data.transformationBlock.isConfigured}
            secondaryButtonOnClick={toggleDataView}
            title={data.transformationBlock.name}
            data={data}
            icon={data.transformationBlock.transformationCatalogItem.icon}
        />
    )
}

export default TransformationBlock;