const styles = {
    Body: {
        HeaderWrapper: 'flex flex-col',
        HeaderContainer: 'flex flex-row items-center space-x-4',
        HeaderTitle: 'text-lg text-kuwala-red font-semibold',
        HeaderDescription: 'mt-2 text-md',
        ContentContainer: 'flex flex-row mt-4 w-full',
        Content: 'flex flex-col bg-white w-full h-full',
        ContentParameterStyling: 'font-semibold mb-6',
        ContentConfigFormWrapper: 'flex flex-col',
        MainContainer: 'flex flex-col flex-auto px-6 pt-2 pb-4 h-full overflow-y-auto w-full',
        ContainerBorderWrapper: 'flex flex-col bg-white border-2 border-kuwala-red rounded-lg h-full px-6 py-6 w-full'
    },
    Footer: {
        FooterContainer: 'flex flex-row justify-between px-6 pb-4'
    },
    Header: {
        MainContainer: 'flex flex-row px-6 py-2',
        IconContainer: 'flex flex-col justify-center items-center bg-white rounded-xl drop-shadow-lg relative p-4 w-24 h-24',
        IconTitle: 'mt-1 text-sm capitalize',
        TagContainer: 'flex flex-col ml-6 space-y-2 bottom-0 justify-end mb-2'
    }
}
export default styles;