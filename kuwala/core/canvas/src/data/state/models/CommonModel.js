import { action } from "easy-peasy";

const CommonModel =  {
    notificationOpen: false,
    openConfigModal: false,
    openTransformationConfigModal: false,
    openExportConfigModal: false,
    reactFlowInstance: null,
    openBlockCatalogModal: false,
    connectionLoaded: false,
    existingBlockLoaded: false,

    toggleNotification: action((state) => {
        state.notificationOpen = !state.notificationOpen
    }),

    toggleBlockCatalogModal: action((state) => {
        state.openBlockCatalogModal = !state.openBlockCatalogModal;
    }),

    setReactFlowInstance: action((state, instance)=> {
       state.reactFlowInstance = instance;
    }),

    setConnectionLoaded: action((state, loaded) => {
        state.connectionLoaded = loaded;
    }),

    setExistingBlockLoaded: action((state, loaded) => {
        state.existingBlockLoaded = loaded;
    }),

    toggleConfigModal: action((state) => {
        state.openConfigModal = !state.openConfigModal
    }),

    toggleTransformationCatalogModal: action((state) => {
        state.openTransformationCatalogModal = !state.openTransformationCatalogModal
    }),

    toggleTransformationConfigModal: action((state) => {
        state.openTransformationConfigModal = !state.openTransformationConfigModal
    }),

    toggleExportConfigModal: action((state) => {
        state.openExportConfigModal = !state.openExportConfigModal
    }),

}

export default CommonModel