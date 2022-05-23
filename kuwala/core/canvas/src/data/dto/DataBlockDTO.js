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
        selectedAddressString,
        connectedSourceNodeIds = [],
        connectedTargetNodeIds = [],
        positionX,
        positionY,
    }) {
        this.tableName = tableName;
        this.schemaName = schemaName;
        this.dataSetName = dataSetName;
        this.dataBlockId = dataBlockId;
        this.dataBlockEntityId = dataBlockEntityId;
        this.isConfigured = isConfigured;
        this.dataSourceDTO = dataSourceDTO;
        this.dataSourceId = dataSourceId;
        this.columns = columns;
        this.name = name;
        this.dataCatalogType = dataCatalogType;
        this.selectedAddressString = selectedAddressString;
        this.connectedSourceNodeIds = connectedSourceNodeIds;
        this.connectedTargetNodeIds = connectedTargetNodeIds;
        this.positionX = positionX;
        this.positionY = positionY;
    }
}