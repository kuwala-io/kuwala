const classes =  {
    CatalogContainer: `flex flex-col flex-shrink-0 justify-between px-6 py-2 rounded-t-md`,
    CatalogContent: `flex flex-row w-64 space-x-4 items-center px-4 py-3 bg-kuwala-green text-white rounded-lg`,
    CatalogListContainer: `flex flex-row space-x-4 items-center mt-0`,
    CatalogBodyContainer: `flex flex-col flex-auto overflow-y-scroll relative px-6 pt-2 pb-4`,
    CatalogBodyAlertText: `flex flex-col w-full h-full text-xl font-light justify-center items-center rounded-tr-lg`,
    SelectedBlockCatalogContainer: `flex flex-row bg-white h-full w-full`,
    BlockCatalogOptionsContainer: `flex flex-col bg-white w-3/12 h-full space-y-3 mr-4`,
    SelectedOptionDetailsContainer: `flex flex-col bg-white w-9/12 rounded-tr-lg`,
    OptionDetailsContainer: `flex flex-col w-full h-full`,
    OptionDetailsAlertText: `flex flex-col w-full h-full text-xl font-light justify-center items-center rounded-tr-lg`,
    TransformationOptionDetailsContent: `flex flex-col w-full h-full border-2 border-kuwala-purple rounded-lg p-6 overflow-y-auto`,
    ExportOptionDetailsContent: `flex flex-col w-full h-full border-2 border-kuwala-red rounded-lg p-6 overflow-y-auto`,
    RequiredColumnBase: `flex flex-row space-x-2 items-center`,
    OptionDetailsParameterAndExample: `flex flex-row mt-4 h-full space-x-6`,
    OptionDetailsParameterContainer: `flex flex-col w-2/12`,
    OptionDetailsExampleContainer: `h-full w-10/12 flex flex-col bg-kuwala-bg-gray rounded-lg p-4 overflow-y-auto`,
    ExampleBase: `text-kuwala-purple font-semibold`,
    BadgeBase: `px-2.5 py-0.5 bg-stone-200 text-gray-400 font-semibold rounded-md text-sm`,
    ModalFooterContainer: `flex flex-row justify-between items-center px-6 pb-4`,
    WideButtonContainer: `flex flex-row items-center space-x-2 w-full`
}
export default classes;