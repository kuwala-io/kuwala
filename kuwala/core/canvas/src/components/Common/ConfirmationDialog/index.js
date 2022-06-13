import Button from "../Button";
import classes from "./styles";
import {useStoreActions} from "easy-peasy";
import CloseButton from "../CloseButton";

const ConfirmationDialog = ({ confirmText, dismissText, isOpen, loading, message, onConfirm, title }) => {
    const {closeDialog} = useStoreActions(actions => actions.confirmationDialog)

    const stopClickPropagation = (e) => {
        e.stopPropagation();
    }

    return (
        isOpen &&
        <div className={classes.FullScreenContainer} onClick={closeDialog}>
            <div className={classes.ContentContainer} onClick={stopClickPropagation}>
                <div className={classes.HeaderContainer}>
                    <div className={classes.Title}>
                        {title}
                    </div>

                    <CloseButton onClick={closeDialog} />
                </div>

                <div>
                    {message}
                </div>

                <div className={classes.ButtonContainer}>
                    <Button
                        onClick={closeDialog}
                        text={dismissText}
                        color={'kuwalaGray'}
                    />

                    <Button
                        onClick={onConfirm}
                        text={confirmText}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    )
}

export default ConfirmationDialog;
