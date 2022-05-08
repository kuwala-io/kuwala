import React from 'react';
import {useStoreActions} from "easy-peasy";
import Block from "../../Common/Block";

const TransformationBlock = ({data, id}) => {
    const {toggleTransformationConfigModal} = useStoreActions(actions => actions.common);
    const {toggleDataView, setSelectedElementByTransformationBlockId} = useStoreActions(actions => actions.canvas);
    const {elements} = useStoreActions(state => state.canvas);

    const checkForConnectedDataBlock = () => {
        let isConnected = false;
        if(elements) {
            elements.forEach((el) => {
                if(el.source && el.target === id) {
                    isConnected = true;
                }
                console.log(el)
            });
        }
        return isConnected;
    }

    return (
        <Block
            leftHandleActive={true}
            rightHandleActive={data.transformationBlock.isConfigured}
            blockColor={'kuwalaPurple'}
            hideLeftHandle={false}
            hideRightHandle={false}

            primaryButtonDisabled={!(data.transformationBlock.connectedSourceNodeIds.length >= data.transformationCatalog.minNumberOfInputBlocks)}
            primaryButtonOnClick={() => {
                toggleTransformationConfigModal();
                setSelectedElementByTransformationBlockId(data.transformationBlock.transformationBlockId)
            }}
            secondaryButtonDisabled={!data.transformationBlock.isConfigured}
            secondaryButtonOnClick={toggleDataView}

            title={data.transformationBlock.name}
            data={data}
            icon={data.transformationBlock.transformationCatalog.icon}
        />
    )
}

export default TransformationBlock;