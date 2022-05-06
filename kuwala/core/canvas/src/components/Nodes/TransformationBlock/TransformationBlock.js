import React from 'react';
import {useStoreActions} from "easy-peasy";
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

            primaryButtonDisabled={false}
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