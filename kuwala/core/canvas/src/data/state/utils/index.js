import {DATA_BLOCK, TRANSFORMATION_BLOCK} from "../../../constants/nodeTypes";

const getNodeTypeByDataCatalogId = (catalogId) => {
    switch (catalogId){
        case('postgres'):
        case('bigquery'):
        case('snowflake'):
            return DATA_BLOCK;
        case('transformation'):
            return TRANSFORMATION_BLOCK;
        default:
            return TRANSFORMATION_BLOCK;
    }
}

export { getNodeTypeByDataCatalogId };
