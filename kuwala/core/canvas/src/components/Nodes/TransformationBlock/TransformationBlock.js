import React from 'react';

import { Handle } from 'react-flow-renderer';
import {useStoreActions, useStoreState} from "easy-peasy";
import { KUWALA_GRAY, KUWALA_GREEN, KUWALA_PURPLE, KUWALA_RED } from "../../../constants/styling";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Button from "../../Common/Button";
import Classes from './TransformationBlockStyle';

const TransformationBlock = ({data}) => {
    const {toggleTransformationConfigModal} = useStoreActions(actions => actions.common);
    const {toggleDataView, setSelectedElementByTransformationBlockId} = useStoreActions(actions => actions.canvas);

    return (
        <div
            className={Classes.BlockWrapper}
        >
                {/* BODY */}
                <div className={Classes.BlockBodyContainer}>
                    <div>
                        <FontAwesomeIcon
                            icon={data.transformationBlock.transformationCatalog.icon}
                            style={{
                                width: 58,
                                height: 58,
                                color: KUWALA_PURPLE,
                            }}
                            draggable={false}
                            className={'user-select-none'}
                        />
                    </div>
                    <div className={Classes.BlockContentWrapper}>
                        <div className={''}>
                            <span>{data.transformationBlock.name}</span>
                        </div>
                        <div className={Classes.BlockButtonContainer}>
                            <Button
                                color={'kuwalaPurple'}
                                solid={false}
                                size={'longXs'}
                                text={'Configure'}
                                onClick={() => {
                                    toggleTransformationConfigModal();
                                    setSelectedElementByTransformationBlockId(data.transformationBlock.transformationBlockId)
                                }}
                            />
                            <Button
                                color={'kuwalaPurple'}
                                solid={false}
                                size={'longXs'}
                                text={'Preview'}
                                onClick={toggleDataView}
                                disabled={!data.transformationBlock.isConfigured}
                            />
                        </div>
                    </div>
                </div>
                <Handle
                    className={Classes.HandleBaseClass}
                    style={{
                        backgroundColor: KUWALA_PURPLE,
                        width: 36,
                        left: -30,
                        height: '100%',
                        borderRadius: 0,
                        border: 'medium none',
                        borderTopLeftRadius: 12,
                        borderBottomLeftRadius: 12,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                    }}
                    d={`${data.id}`}
                    type="source"
                    position="left"
                    isConnectable={true}
                />
                <Handle
                    className={Classes.HandleBaseClass}
                    style={{
                        backgroundColor: data.transformationBlock.isConfigured ? KUWALA_PURPLE : KUWALA_GRAY,
                        width: 36,
                        right: -30,
                        height: '100%',
                        borderRadius: 0,
                        border: 'medium none',
                        borderTopRightRadius: 12,
                        borderBottomRightRadius: 12,
                    }}
                    d={`${data.id}`}
                    type="source"
                    position="right"
                    isConnectable={data.transformationBlock.isConfigured}
                />
        </div>
    )
}

export default TransformationBlock;