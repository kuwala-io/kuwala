export default {
    CatalogContainer: `flex flex-col w-full`,
    CatalogContent: `flex flex-row w-64 space-x-4 items-center px-4 py-3 bg-kuwala-green text-white rounded-lg`,
    CatalogListContainer: `flex flex-row space-x-4 items-center mt-4`,
    CatalogItem: (selectedTransformationIndex, index) => {
        return `px-4 py-2 border rounded-md border-kuwala-red space-x-2
                ${selectedTransformationIndex === index ? 'bg-kuwala-red text-white' : 'bg-white text-kuwala-red'} 
                hover:bg-kuwala-red hover:text-white cursor-pointer`
    },
    CatalogBodyAlertText: `flex flex-col w-full h-full text-xl font-light justify-center items-center rounded-tr-lg`,
    SelectedTransformationContainer: `flex flex-row bg-white h-full w-full`,
    TransformationOptionsContainer: `flex flex-col bg-white w-3/12 h-full space-y-3 mr-4`,
    SelectedOptionDetailsContainer: `flex flex-col bg-white w-9/12 rounded-tr-lg`,
    OptionDetailsContainer: `flex flex-col w-full h-full`,
    OptionItem: (selectedCatalogOption, index) => {
        return `px-4 py-2 border rounded-md border-kuwala-purple space-x-2
                ${selectedCatalogOption === index ? 'bg-kuwala-purple text-white' : 'bg-white text-kuwala-purple'} 
                hover:bg-kuwala-purple hover:text-white cursor-pointer`
    },
    OptionDetailsAlertText: `flex flex-col w-full h-full text-xl font-light justify-center items-center rounded-tr-lg`,
    OptionDetailsContent: `flex flex-col w-full h-full border-2 border-kuwala-purple rounded-lg p-6 overflow-y-auto`,
    RequiredColumnBase: `flex flex-row space-x-2 items-center`,
    OptionDetailsParameterAndExample: `flex flex-row mt-4 h-full space-x-6`,
    OptionDetailsParameterContainer: `flex flex-col w-2/12`,
    OptionDetailsExampleContainer: `h-full w-10/12 flex flex-col bg-kuwala-bg-gray rounded-lg p-4 overflow-y-scroll`,
    ExampleBase: `text-kuwala-purple font-semibold`,
    BadgeBase: `px-2.5 py-0.5 bg-stone-200 text-gray-400 font-semibold rounded-md text-sm`,
    ModalFooterContainer: `flex flex-row justify-between items-center px-6 pb-4`,
}