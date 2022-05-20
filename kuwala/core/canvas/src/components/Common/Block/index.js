import Classes from "../../Nodes/TransformationBlock/TransformationBlockStyle";
import Icon from "../Icon";
import Button from "../Button";
import {Handle} from "react-flow-renderer";
import {COLOR_MAP, KUWALA_GRAY} from "../../../constants/styling";
import React from "react";

const Block = ({
        blockColor,
        title,
        primaryButtonDisabled,
        primaryButtonOnClick,
        secondaryButtonDisabled,
        secondaryButtonOnClick,
        leftHandleActive,
        hideLeftHandle,
        rightHandleActive,
        hideRightHandle,
        data,
        icon,
        img
    }) => {
    const renderLeftPane = () => {
        if(!hideLeftHandle) {
            return (
                <Handle
                    className={Classes.HandleBaseClass}
                    style={{
                        backgroundColor: leftHandleActive ? COLOR_MAP[blockColor] : KUWALA_GRAY,
                        width: 32,
                        left: -24,
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
        return undefined;
    }

    const renderRightHandle = () => {
        if(!hideRightHandle) {
            return (
                <Handle
                    className={Classes.HandleBaseClass}
                    style={{
                        backgroundColor: rightHandleActive ? COLOR_MAP[blockColor] : KUWALA_GRAY,
                        width: 32,
                        right: -24,
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
        return undefined;
    }

    const renderImgOrIcon = () => {
        if(img) {
            return (
                <img
                    src={img}
                    className={'user-select-none'}
                    style={{
                        width: 64,
                        height: 64,
                    }}
                    draggable={false}
                    alt={'Data source logo'}
                />
            )
        } else {
            return (
                <Icon
                    size={'md'}
                    icon={icon}
                    color={blockColor}
                />
            )
        }
    }

    return (
        <div
            className={Classes.BlockWrapper}
        >
            {/* BODY */}
            <div className={Classes.BlockBodyContainer}>
                {renderImgOrIcon()}
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
                            onClick={primaryButtonOnClick}
                            disabled={primaryButtonDisabled}
                        />
                        <Button
                            color={blockColor}
                            solid={true}
                            size={'longXs'}
                            text={'Preview'}
                            onClick={secondaryButtonOnClick}
                            disabled={secondaryButtonDisabled}
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