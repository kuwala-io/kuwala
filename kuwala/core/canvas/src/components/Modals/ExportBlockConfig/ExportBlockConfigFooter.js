import Button from "../../Common/Button";
import React from "react";
import Styles from "./ExportBlockConfigModalStyle"

const ExportBlockConfigFooter = ({ isExportBlockSaveLoading, submitForm, toggleConfigModalWrapper }) => {
    return (
        <div className={Styles.Footer.FooterContainer}>
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
