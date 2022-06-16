import React from "react";
import Icon from "../../Common/Icon";
import ConfigurationForm from '../TransformationBlockConfig/ConfigurationForm'

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
            <div className={'flex flex-col'}>
                <div className={'flex flex-row items-center space-x-4'}>
                    <Icon
                        size={'sm'}
                        color={'kuwalaRed'}
                        icon={selectedElement.data.exportCatalogItem.icon}
                    />

                    <span className={'text-lg text-kuwala-red font-semibold'}>
                        {selectedElement.data.exportCatalogItem.name}
                    </span>
                </div>

                <span className={'mt-2 text-md'}>
                    {selectedElement.data.exportCatalogItem.description}
                </span>
            </div>
        )
    }

    const renderConfigBodyContent = ({values, setFieldValue}) => {
        return (
            <div className={'flex flex-row mt-4 w-full'}>
                <div className={'flex flex-col bg-white w-7/12 h-full'}>
                    <span className={'font-semibold mb-6'}>
                        Parameters
                    </span>

                    <div className={'flex flex-col'}>
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
        <div className={'flex flex-col flex-auto px-6 pt-2 pb-4 h-full overflow-y-auto w-full'}>
            <div className={'flex flex-row bg-white border-2 border-kuwala-red rounded-lg h-full w-full'}>
                <div className={'flex flex-col px-6 py-6 w-full'}>
                    {renderConfigBodyHeader()}
                    {renderConfigBodyContent({values, setFieldValue})}
                </div>
            </div>
        </div>
    )
}

export default ExportBlockConfigBody;
