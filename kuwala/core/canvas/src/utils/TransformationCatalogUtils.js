import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faAlignLeft,
    faCalculator,
    faClock,
    faFilter,
    faLink,
    faMapMarkedAlt,
    faShuffle
} from "@fortawesome/free-solid-svg-icons";

export const getCatalogItemIcon = (iconName) => {
    switch (iconName){
        case 'clock':
            return <FontAwesomeIcon icon={faClock}/>
        case 'align-left':
            return <FontAwesomeIcon icon={faAlignLeft}/>
        case 'calculator':
            return <FontAwesomeIcon icon={faCalculator}/>
        case 'map-marked-alt':
            return <FontAwesomeIcon icon={faMapMarkedAlt}/>
        case 'link':
            return <FontAwesomeIcon icon={faLink}/>
        case 'filter':
            return <FontAwesomeIcon icon={faFilter}/>
        default:
            return <FontAwesomeIcon icon={faShuffle}/>
    }
}