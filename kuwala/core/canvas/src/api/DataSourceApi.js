import baseAxios from "./BaseAxios";

import {
    DATA_SOURCE
} from "../constants/api"

export function getDataSource() {
    return baseAxios.get(DATA_SOURCE)
}
