import {action, thunk} from "easy-peasy";

const ConfirmationDialogModel = {
    confirmText: undefined,
    dismissText: undefined,
    isOpen: false,
    loading: false,
    message: undefined,
    onConfirm: undefined,
    refreshBlocks: false,
    title: undefined,
    closeDialog: action((state) => {
        state.confirmText = undefined;
        state.dismissText = undefined;
        state.message = undefined;
        state.onConfirm = undefined;
        state.onDissmiss = undefined;
        state.title = undefined;
        state.isOpen = false;
    }),
    openDialog: action((state) => {
        state.isOpen = true;
    }),
    setConfirmText: action((state, confirmText) => {
        state.confirmText = confirmText;
    }),
    setDismissText: action((state, dismissText) => {
        state.dismissText = dismissText;
    }),
    setLoading: action((state, loading) => {
        state.loading = loading;
    }),
    setMessage: action((state, message) => {
        state.message = message;
    }),
    setOnConfirm: action((state, onConfirm) => {
        state.onConfirm = onConfirm;
    }),
    setRefreshBlocks: action((state, refreshBlocks) => {
        state.refreshBlocks = refreshBlocks;
    }),
    setTitle: action((state, title) => {
        state.title = title;
    }),
    setTexts: thunk((
        { setConfirmText, setDismissText, setMessage, setTitle },
        { confirmText, dismissText, message, title },
    ) => {
        setConfirmText(confirmText);
        setDismissText(dismissText);
        setMessage(message);
        setTitle(title);
    }),
}

export default ConfirmationDialogModel;
