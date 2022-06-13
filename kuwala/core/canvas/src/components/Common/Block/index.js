import Classes from "./BlockStyle";
import Icon from "../Icon";
import Button from "../Button";
import {Handle} from "react-flow-renderer";
import {COLOR_MAP, KUWALA_GRAY} from "../../../constants/styling";
import React from "react";
import CloseButton from "../CloseButton";

const Block = ({
        blockColor,
        data,
        hideLeftHandle,
        hideRightHandle,
        icon,
        img,
        leftHandleActive,
        onDelete,
        primaryButtonDisabled,
        primaryButtonOnClick,
        rightHandleActive,
        secondaryButtonDisabled,
        secondaryButtonOnClick,
        selected,
        title,
}) => {
    const getBorderColor = (jsx = false) => {
        let color;

        switch (blockColor) {
            case 'kuwalaPurple':
                color = jsx ? COLOR_MAP[blockColor] : 'kuwala-purple';
                break;
            default:
                color = jsx ? COLOR_MAP[blockColor] : 'kuwala-green';
        }

        return jsx ? color : `border-${color}`;
    }

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
                        borderWidth: selected ? 2 : 0,
                        borderColor: getBorderColor(true),
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
                        borderWidth: selected ? 2 : 0,
                        borderColor: getBorderColor(true),
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

    const renderDeleteButton = () => {
        return (
            <div className={Classes.DeleteButtonClass}>
                <CloseButton onClick={onDelete} />
            </div>
        )
    }

    const renderBody = () => {
        return (
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

                {renderDeleteButton()}
            </div>
        );
    }


    return (
        <div
            className={`${Classes.BlockWrapper} ${selected ? 'border-2' : 'border-0'} ${getBorderColor()}`}
        >
            {renderLeftPane()}
            {renderBody()}
            {renderRightHandle()}
        </div>
    )
}

export default Block;