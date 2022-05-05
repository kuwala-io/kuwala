import {useStoreActions} from "easy-peasy";
import Classes from "../../Nodes/TransformationBlock/TransformationBlockStyle";
import Icon from "../Icon";
import Button from "../Button";
import {Handle} from "react-flow-renderer";
import {COLOR_MAP, KUWALA_GRAY, KUWALA_PURPLE} from "../../../constants/styling";
import React from "react";

const Block = ({
        blockColor='kuwalaGreen',
        title='Title',
        primaryButtonActive=true,
        primaryButtonOnclick,
        secondaryButtonActive=true,
        secondaryButtonOnclick,
        leftHandleActive=true,
        hideLeftHandle=false,
        rightHandleActive=true,
        hideRightHandle=false,
        data,
        icon='cogs'
    }) => {
    const renderLeftPane = () => {
        if(!hideLeftHandle) {
            return (
                <Handle
                    className={Classes.HandleBaseClass}
                    style={{
                        backgroundColor: leftHandleActive ? COLOR_MAP[blockColor] : KUWALA_GRAY,
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
                    type="target"
                    position="left"
                    isConnectable={leftHandleActive}
                />
            )
        }
        return <></>
    }

    const renderRightHandle = () => {
        if(!hideRightHandle) {
            return (
                <Handle
                    className={Classes.HandleBaseClass}
                    style={{
                        backgroundColor: rightHandleActive ? COLOR_MAP[blockColor] : KUWALA_GRAY,
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
                    isConnectable={rightHandleActive}
                />
            )
        }
        return <></>
    }

    return (
        <div
            className={Classes.BlockWrapper}
        >
            {/* BODY */}
            <div className={Classes.BlockBodyContainer}>
                <Icon
                    size={'lg'}
                    icon={icon}
                    color={blockColor}
                />
                <div className={Classes.BlockContentWrapper}>
                    <div className={Classes.BlockTitle}>
                        <span>{title}</span>
                    </div>

                    <div className={Classes.BlockButtonContainer}>
                        <Button
                            color={blockColor}
                            solid={false}
                            size={'longXs'}
                            text={'Configure'}
                            onClick={primaryButtonOnclick}
                            disabled={primaryButtonOnclick}
                        />
                        <Button
                            color={blockColor}
                            solid={false}
                            size={'longXs'}
                            text={'Preview'}
                            onClick={secondaryButtonOnclick}
                            disabled={secondaryButtonActive}
                        />
                    </div>

                </div>
            </div>
            {renderLeftPane()}
            {renderRightHandle()}
        </div>
    )
}

export default Block;