module.exports = class TransformationBlockDTO {
    constructor ({
        transformationBlockId,
        transformationBlockEntityId,
        isConfigured,
        transformationCatalogItemId,
        transformationCatalogItem,
        inputBlockIds,
        macroParameters,
        name,
        connectedSourceNodeIds = [],
        connectedTargetNodeIds = [],
        materializeTable= false,
        columns=[],
        positionX,
        positionY,

    }) {
        this.transformationBlockId = transformationBlockId;
        this.transformationBlockEntityId = transformationBlockEntityId;
        this.isConfigured = isConfigured;
        this.transformationCatalogItemId = transformationCatalogItemId;
        this.transformationCatalogItem = transformationCatalogItem;
        this.inputBlockIds = inputBlockIds;
        this.macroParameters = macroParameters;
        this.name = name;
        this.connectedSourceNodeIds = connectedSourceNodeIds;
        this.connectedTargetNodeIds = connectedTargetNodeIds;
        this.materializeTable = materializeTable;
        this.columns = columns;
        this.positionX = positionX;
        this.positionY = positionY;
    }
}