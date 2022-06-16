import Button from "../../Common/Button";
import React from "react";

const ExportBlockConfigFooter = ({ isExportBlockSaveLoading, submitForm, toggleConfigModalWrapper }) => {
    return (
        <div className={'flex flex-row justify-between px-6 pb-4'}>
            <Button
                onClick={toggleConfigModalWrapper}
                text={'Back'}
                color={'kuwalaRed'}
            />

            <Button
                type={'submit'}
                loading={isExportBlockSaveLoading}
                disabled={isExportBlockSaveLoading}
                text={'Save'}
                color={'kuwalaRed'}
                onClick={submitForm}
            />
        </div>
    )
}

export default ExportBlockConfigFooter;
