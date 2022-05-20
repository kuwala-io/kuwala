import Button from "../../Common/Button";
import React from "react";

const DataBlockConfigFooter = ({ onClickBack, onClickSave, saveButtonDisabled, saveButtonLoading }) => {
    return (
        <div className={'flex flex-row justify-between px-6 pb-4'}>
            <Button
                onClick={onClickBack}
                text={'Back'}
            />
            <Button
                onClick={onClickSave}
                loading={saveButtonLoading}
                disabled={saveButtonDisabled}
                text={'Save'}
            />
        </div>
    )
}

export default DataBlockConfigFooter;
