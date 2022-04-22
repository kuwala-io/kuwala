import baseAxios from "./BaseAxios";
import qs from 'qs';

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
    return baseAxios.put(
        `${DATA_SOURCE}/${data.id}/connection`,
        data.config
    )
}

export function getSchema(id) {
    return baseAxios.get(
        `${DATA_SOURCE}/${id}/schema`
    )
}

export function getColumns({id, params}){
    return baseAxios.get(
        `${DATA_SOURCE}/${id}/table/columns`,
        {params}
    )
}

export function getTablePreview({id, params}){
    return baseAxios.get(
        `${DATA_SOURCE}/${id}/table/preview`,
        {
            params,
            paramsSerializer: function(params) {
                return qs.stringify(params, {arrayFormat: 'repeat'})
            },
        }
    )
}