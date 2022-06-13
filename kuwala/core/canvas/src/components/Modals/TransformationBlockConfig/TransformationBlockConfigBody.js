import React from "react";
import Icon from "../../Common/Icon";
import ConfigurationForm from './ConfigurationForm'

const TransformationBlockConfigBody = ({
   elements,
   selectedElement,
   setFieldValue,
   setShowToolTip,
   setSubmitData,
   showToolTip,
   values
}) => {
    const renderConfigBodySettings = ({ setFieldValue, values }) => {
        return (
            <div className={'flex flex-row items-center space-x-4'}>
                <div className={'w-8 h-8 bg-white border-2 border-kuwala-purple rounded-full cursor-pointer flex flex-col items-center justify-center'}
                     onClick={
                         () => setFieldValue('materializeTable', !values.materializeTable)
                     }
                >
                    {
                        values.materializeTable ? (
                            <Icon
                                icon={'check'}
                                color={'kuwalaPurple'}
                                size={'fill'}
                            />
                        ) : undefined
                    }
                </div>

                <span className={'text-md'}>
                    Save as Table
                </span>

                <div
                    className={'w-7 h-7 bg-kuwala-light-purple rounded-full cursor-pointer flex flex-col items-center justify-center relative'}
                    onMouseEnter={() => {
                        setSubmitData(values);
                        setShowToolTip(true);
                    }}
                    onMouseLeave={() => {
                        setSubmitData(values);
                        setShowToolTip(false);
                    }}
                >
                    <Icon
                        icon={'question'}
                        color={'kuwalaPurple'}
                        size={'fill'}
                    />

                    <div
                        className={`absolute rounded-lg mt-40 w-72 text-sm border border-kuwala-light-purple bg-white-100 px-4 py-2 ${showToolTip ? 'block' : 'hidden'}`}
                    >
                        <p>You can save the result of this</p>
                        <p>transformation as a table in your data</p>
                        <p>warehouse. It takes up storage but</p>
                        <p>improves the query performance of</p>
                        <p>subsequent transformations.</p>
                    </div>
                </div>
            </div>
        )
    }

    const renderConfigBodyHeader = () => {
        return (
            <div className={'flex flex-col'}>
                <div className={'flex flex-row items-center space-x-4'}>
                    <Icon
                        size={'sm'}
                        color={'kuwalaPurple'}
                        icon={selectedElement.data.transformationCatalogItem.icon}
                    />

                    <span className={'text-lg text-kuwala-purple font-semibold'}>
                        {selectedElement.data.transformationCatalogItem.name}
                    </span>
                </div>

                <span className={'mt-2 text-md'}>
                    {selectedElement.data.transformationCatalogItem.description}
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

                <div className={'flex flex-col bg-white w-5/12 h-full'}>
                    <span className={'font-semibold mb-6'}>
                        Settings
                    </span>

                    {renderConfigBodySettings({values, setFieldValue})}
                </div>
            </div>
        )
    }

    return (
        <div className={'flex flex-col flex-auto px-6 pt-2 pb-4 h-full overflow-y-auto w-full'}>
            <div className={'flex flex-row bg-white border-2 border-kuwala-purple rounded-lg h-full w-full'}>
                <div className={'flex flex-col px-6 py-6 w-full'}>
                    {renderConfigBodyHeader()}
                    {renderConfigBodyContent({values, setFieldValue})}
                </div>
            </div>
        </div>
    )
}

export default TransformationBlockConfigBody;
