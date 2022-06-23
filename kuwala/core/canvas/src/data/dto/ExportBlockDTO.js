module.exports = class ExportBlockDTO {
    constructor ({
             exportBlockId,
             exportBlockEntityId,
             isConfigured,
             exportCatalogItemId,
             exportCatalogItem,
             inputBlockIds,
             macroParameters,
             name,
             connectedSourceNodeIds = [],
             connectedTargetNodeIds = [],
             columns=[],
             positionX,
             positionY,
     }) {
        this.exportBlockId = exportBlockId;
        this.exportBlockEntityId = exportBlockEntityId;
        this.isConfigured = isConfigured;
        this.exportCatalogItemId = exportCatalogItemId;
        this.exportCatalogItem = exportCatalogItem;
        this.inputBlockIds = inputBlockIds;
        this.macroParameters = macroParameters;
        this.name = name;
        this.connectedSourceNodeIds = connectedSourceNodeIds;
        this.connectedTargetNodeIds = connectedTargetNodeIds;
        this.columns = columns;
        this.positionX = positionX;
        this.positionY = positionY;
    }
}