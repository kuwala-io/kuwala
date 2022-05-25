import React, {useState} from "react";
import {useStoreActions} from "easy-peasy";
import Modal from "../../Common/Modal";
import Button from "../../Common/Button";
import TransformationCatalogModal from "./TransformationCatalog/TransformationCatalogModal";
import ExportCatalogModal from "./ExportCatalog/ExportCatalogModal";

export default ({isOpen}) => {
    const { toggleTransformationCatalogModal } = useStoreActions(actions => actions.common);
    const [selectedAction, setSelectedAction] = useState(0);

    const actions = [{
        id: 'tfBlockAction',
        text: 'Transformation Blocks',
        icon: 'shuffle',
        color: 'kuwalaGreen',
    }, {
        id: 'exBlockAction',
        text: 'Export Blocks',
        icon: 'share-from-square',
        color: 'kuwalaGreen',
    }]

    const ActionSelector = () => {
        return (
            <div className={`flex flex-row space-x-4 flex-shrink-0 items-center px-6 py-4 rounded-t-md`}>
                {
                    actions.map((el, index) => <Button
                        key={el.id}
                        onClick={()=>{
                           setSelectedAction(index)
                        }}
                        selected={selectedAction === index}
                        solid={false}
                        color={'kuwalaGreen'}
                        icon={el.icon}
                        text={el.text}
                        size={'mid'}
                    />)
                }
            </div>
        )
    }

    const renderActionsBody = () => {
        switch (selectedAction){
            case 0:
                return <TransformationCatalogModal/>
            case 1:
                return <ExportCatalogModal/>
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            closeModalAction={toggleTransformationCatalogModal}
        >
            <ActionSelector/>
            {renderActionsBody()}
        </Modal>
    )
}