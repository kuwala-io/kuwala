module.exports = class DataBlocksDTO {
    constructor
    ({
        tableName,
        schemaName,
        dataBlockId,
        dataBlockEntityId,
        isConfigured,
        dataSourceDTO,
        dataSourceId,
        columns,
        name,
        dataCatalogType,
        dataSetName,
        selectedAddressString
    }) {
        this.tableName = tableName
        this.schemaName = schemaName
        this.dataSetName = dataSetName
        this.dataBlockId = dataBlockId
        this.dataBlockEntityId = dataBlockEntityId
        this.isConfigured = isConfigured
        this.dataSourceDTO = dataSourceDTO
        this.dataSourceId = dataSourceId
        this.columns = columns
        this.name = name
        this.dataCatalogType = dataCatalogType
        this.selectedAddressString = selectedAddressString
    }
}