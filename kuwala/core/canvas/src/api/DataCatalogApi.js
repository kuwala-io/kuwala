import baseAxios from "./BaseAxios";

import {
    DATA_CATALOG
} from "../constants/api"

export function getAllDataCatalog (){
    // return baseAxios.get(DATA_CATALOG);

    return Promise.resolve([{
        "id": "postgres",
        "name": "Postgres",
        "logo": "https://wiki.postgresql.org/images/9/9a/PostgreSQL_logo.3colors.540x557.png",
        "connection_parameters":[
            {
                "id": "host",
                "name": "Host",
                "type": "string"
            },
            {
                "id": "port",
                "name": "Port",
                "type": "integer"
            },
            {
                "id": "user",
                "name": "User",
                "type": "string"
            },
            {
                "id": "password",
                "name": "Password",
                "type": "string"
            },
            {
                "id": "database",
                "name": "Database",
                "type": "string"
            }
        ]
    }
    ]);
}