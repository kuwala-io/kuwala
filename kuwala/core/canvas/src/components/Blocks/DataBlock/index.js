import React from 'react';
import {useStoreActions, useStoreState} from "easy-peasy";
import Block from "../../Common/Block";
import {deleteDataBlock} from '../../../api/DataBlockApi';

const DataBlock = ({data, id}) => {
    const { selectedElement } = useStoreState(({ canvas }) => canvas);
    const { toggleConfigModal } = useStoreActions(({ common }) => common);
    const {
        removeNodes,
        setSelectedElementByDataBlockId,
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
    } = useStoreActions(({ transformationBlocks }) => transformationBlocks);

    const openConfigModal = () => {
        setSelectedElementByDataBlockId(data.dataBlock.dataBlockId);
        toggleConfigModal();
    }

    const onDelete = () => {
        if (data.dataBlock.dataBlockEntityId) {
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
            await deleteDataBlock({
                dataBlockId: data.dataBlock.dataBlockEntityId
            });
            setRefreshBlocks(true);
            setLoading(false);
            closeDialog();
        } catch (error) {
            console.error(error);
            alert('Failed to delete data block')
        } finally {
            setLoading(false);
        }
    }

    return (
        <Block
            blockColor={'kuwalaGreen'}
            data={data}
            hideLeftHandle={true}
            hideRightHandle={false}
            img={data.dataSource.logo}
            leftHandleActive={false}
            onDelete={onDelete}
            primaryButtonDisabled={false}
            primaryButtonOnClick={openConfigModal}
            rightHandleActive={data.dataBlock.isConfigured}
            secondaryButtonDisabled={!data.dataBlock.isConfigured}
            secondaryButtonOnClick={toggleDataView}
            selected={selectedElement && selectedElement.id === id}
            title={data.dataBlock.name}
        />
    );
};

export default DataBlock;