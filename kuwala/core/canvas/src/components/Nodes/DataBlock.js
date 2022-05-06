import React from 'react';
import {useStoreActions} from "easy-peasy";
import Block from "../Common/Block";

const DataBlock = (({data}) => {
    const {toggleConfigModal} = useStoreActions(actions => actions.common);
    const {toggleDataView, setSelectedElementByDataBlockId} = useStoreActions(actions => actions.canvas);
    return (
        <Block
            leftHandleActive={false}
            rightHandleActive={data.dataBlock.isConfigured}
            blockColor={'kuwalaGreen'}
            hideLeftHandle={true}
            hideRightHandle={false}

            primaryButtonDisabled={false}
            primaryButtonOnClick={() => {
                setSelectedElementByDataBlockId(data.dataBlock.dataBlockId)
                toggleConfigModal()
            }}
            secondaryButtonDisabled={!data.dataBlock.isConfigured}
            secondaryButtonOnClick={toggleDataView}

            title={data.dataBlock.name}
            data={data}
            img={data.dataSource.logo}
        />
    );
});

export default DataBlock;