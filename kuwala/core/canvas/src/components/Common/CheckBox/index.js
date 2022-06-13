import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import styles from "./styles";

const CheckBox = ({ checked, onClick }) => {
    return (
        <div
            className={styles.circle}
            onClick={onClick}
        >
            {checked &&
                <FontAwesomeIcon
                    icon={faCheck}
                    className={styles.check}
                />
            }
        </div>
    );
};

export default CheckBox;
