import Icon from "../../Common/Icon";
import React from "react";
import {Tag, TextInput} from "../../Common";
import Styles from "./ExportBlockConfigModalStyle"

const ExportBlockConfigHeader = ({ onNameChange, selectedElement, exportBlockName }) => {
    return (
        <div className={Styles.Header.MainContainer}>
            <div
                className={Styles.Header.IconContainer}
            >
                <Icon
                    icon={selectedElement.data.exportCatalogItem.categoryIcon}
                    size={'lg'}
                    color={'kuwalaRed'}
                />

                <span className={Styles.Header.IconTitle}>
                    {selectedElement.data.exportCatalogItem.category}
                </span>
            </div>

            <div className={Styles.Header.TagContainer}>
                <Tag text={'Export Block'} color={'red'} />

                <TextInput
                    color={"red"}
                    label={"Name"}
                    onChange={onNameChange}
                    value={exportBlockName}
                />
            </div>
        </div>
    )
}

export default ExportBlockConfigHeader;