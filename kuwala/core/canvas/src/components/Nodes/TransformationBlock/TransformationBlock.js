import React from 'react';
import {useStoreActions, useStoreState} from "easy-peasy";
import Block from "../../Common/Block";

const TransformationBlock = ({data}) => {
    const {toggleTransformationConfigModal} = useStoreActions(actions => actions.common);
    const {toggleDataView, setSelectedElementByTransformationBlockId} = useStoreActions(actions => actions.canvas);

    return (
        <Block
            leftHandleActive={true}
            rightHandleActive={data.transformationBlock.isConfigured}
            blockColor={'kuwalaPurple'}
            hideLeftHandle={false}
            hideRightHandle={false}
            primaryButtonActive={true}
            primaryButtonOnclick={() => {
                toggleTransformationConfigModal();
                setSelectedElementByTransformationBlockId(data.transformationBlock.transformationBlockId)
            }}
            secondaryButtonActive={!data.transformationBlock.isConfigured}
            secondaryButtonOnclick={toggleDataView}
            title={data.transformationBlock.name}
            data={data}
            icon={data.transformationBlock.transformationCatalog.icon}
        />
    )
}

export default TransformationBlock;