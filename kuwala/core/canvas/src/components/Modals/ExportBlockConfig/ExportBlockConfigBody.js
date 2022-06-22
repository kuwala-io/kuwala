import React from "react";
import Icon from "../../Common/Icon";
import ConfigurationForm from '../TransformationBlockConfig/ConfigurationForm'
import Styles from "./ExportBlockConfigModalStyle"

const ExportBlockConfigBody = ({
       elements,
       selectedElement,
       setFieldValue,
       setShowToolTip,
       setSubmitData,
       showToolTip,
       values
   }) => {
    const renderConfigBodyHeader = () => {
        return (
            <div className={Styles.Body.HeaderWrapper}>
                <div className={Styles.Body.HeaderContainer}>
                    <Icon
                        size={'sm'}
                        color={'kuwalaRed'}
                        icon={selectedElement.data.exportCatalogItem.icon}
                    />

                    <span className={Styles.Body.HeaderTitle}>
                        {selectedElement.data.exportCatalogItem.name}
                    </span>
                </div>

                <span className={Styles.Body.HeaderDescription}>
                    {selectedElement.data.exportCatalogItem.description}
                </span>
            </div>
        )
    }

    const renderConfigBodyContent = ({values, setFieldValue}) => {
        return (
            <div className={Styles.Body.ContentContainer}>
                <div className={Styles.Body.Content}>
                    <span className={Styles.Body.ContentParameterStyling}>
                        Parameters
                    </span>

                    <div className={Styles.Body.ContentConfigFormWrapper}>
                        <ConfigurationForm
                            elements={elements}
                            selectedElement={selectedElement}
                            setFieldValue={setFieldValue}
                            values={values}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={Styles.Body.MainContainer}>
            <div className={Styles.Body.ContainerBorderWrapper}>
                {renderConfigBodyHeader()}
                {renderConfigBodyContent({values, setFieldValue})}
            </div>
        </div>
    )
}

export default ExportBlockConfigBody;
