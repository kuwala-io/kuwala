import Button from "../../Common/Button";
import React from "react";

const TransformationBlockConfigFooter = ({ isTransformationBlockSaveLoading, submitForm, toggleConfigModalWrapper }) => {
    return (
        <div className={'flex flex-row justify-between px-6 pb-4'}>
            <Button
                onClick={toggleConfigModalWrapper}
                text={'Back'}
                color={'kuwalaPurple'}
            />

            <Button
                type={'submit'}
                loading={isTransformationBlockSaveLoading}
                disabled={isTransformationBlockSaveLoading}
                text={'Save'}
                color={'kuwalaPurple'}
                onClick={submitForm}
            />
        </div>
    )
}

export default TransformationBlockConfigFooter;
