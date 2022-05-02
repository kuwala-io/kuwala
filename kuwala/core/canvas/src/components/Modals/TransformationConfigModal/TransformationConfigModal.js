import Modal from "../../Common/Modal";
import React from "react";
import {SELECTOR_DISPLAY} from "../../../constants/components";
import {useStoreActions} from "easy-peasy";

export default ({isOpen}) => {
    const {toggleTransformationConfigModal} = useStoreActions(actions => actions.common);
    const toggleConfigModalWrapper = () => {
        toggleTransformationConfigModal();
    }

    return (
        <Modal
            isOpen={isOpen}
            closeModalAction={toggleConfigModalWrapper}
        >
            TRANSFORMATION CONFIG
        </Modal>
    )
}