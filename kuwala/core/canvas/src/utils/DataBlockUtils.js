import DataBlockDTO from "../data/dto/DataBlockDTO"
import {getDatabaseTitleValue} from "./SchemaUtils";

export function getDataBlockAddressString ({dataBlockResponse, dataSource, schema}) {

    function lookUpTableCategories (schema_name, table_name) {
        let categoryName = 'tables';
        const targetSchema = schema.find((el) => el.schema === schema_name);
        for (const cat of targetSchema.categories) {
            if (!cat.tables) break;
            if (cat.tables.includes(table_name)) {
                categoryName = cat.category;
            }
        }
        return `${schema_name}@${categoryName}@${table_name}`
    }

    switch (dataSource.dataCatalogItemId){
        case 'postgres':
        case 'snowflake':
            return lookUpTableCategories(dataBlockResponse.schema_name, dataBlockResponse.table_name);
        case 'bigquery':
            return `${getDatabaseTitleValue(dataSource)}@${dataBlockResponse.dataset_name}@${dataBlockResponse.table_name}`;
    };
    return null;
}

export function fromAPIResponseToDTO ({dataBlockResponse, dataSource, schema}) {
    const dto = new DataBlockDTO({
        positionX: dataBlockResponse.position_x,
        positionY: dataBlockResponse.position_y,
        tableName: dataBlockResponse.table_name,
        schemaName: dataBlockResponse.schema_name,
        dataSetName: dataBlockResponse.dataset_name,
        dataBlockId: dataBlockResponse.id,
        dataBlockEntityId: dataBlockResponse.id,
        isConfigured: true,
        dataSourceDTO: dataSource,
        dataCatalogType: dataSource.dataCatalogItemId,
        dataSourceId: dataBlockResponse.data_source_id,
        columns: dataBlockResponse.columns,
        name: dataBlockResponse.name,
        selectedAddressString: getDataBlockAddressString({dataBlockResponse, dataSource, schema}),
    });
    return dto
}