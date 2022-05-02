import {library} from "@fortawesome/fontawesome-svg-core";
import {
    faAlignLeft,
    faCalculator,
    faClock,
    faFilter,
    faLink,
    faMapMarkedAlt,
    faShuffle,
    faGreaterThan,
    faGreaterThanEqual,
    faPlus,
    faCheckCircle,
    faTimesCircle,
    faCogs,
} from "@fortawesome/free-solid-svg-icons";
export default () => {
    library.add(
        faClock,
        faAlignLeft,
        faCalculator,
        faMapMarkedAlt,
        faLink,
        faFilter,
        faShuffle,
        faGreaterThan,
        faGreaterThanEqual,
        faPlus,
        faCheckCircle,
        faTimesCircle,
        faCogs
    )
}