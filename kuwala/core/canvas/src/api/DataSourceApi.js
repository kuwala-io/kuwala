import baseAxios from "./BaseAxios";

import {
    DATA_SOURCE
} from "../constants/api"

export function getDataSource() {
    return baseAxios.get(DATA_SOURCE)
}

export function testConnection(data) {
    return baseAxios.post(
        `${DATA_SOURCE}/${data.id}/connection/test`,
        data.config
    )
}

export function saveConnection(data) {
    console.log(`SAVE CONNECTION CALLED WITH URL`)
    console.log(`${DATA_SOURCE}/${data.id}/connection`)
    return baseAxios.put(
        `${DATA_SOURCE}/${data.id}/connection`,
        data.config
    )
}
