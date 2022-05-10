module.exports = class TransformationBlockDTO {
    constructor
    ({
        transformationBlockId,
        transformationBlockEntityId,
        isConfigured,
        transformationCatalogItemId,
        transformationCatalog,
        inputBlockIds,
        macroParameters,
        name,
        connectedSourceNodeIds = [],
        connectedTargetNodeIds = [],
     }) {
        this.transformationBlockId = transformationBlockId;
        this.transformationBlockEntityId = transformationBlockEntityId;
        this.isConfigured = isConfigured;
        this.transformationCatalogItemId = transformationCatalogItemId;
        this.transformationCatalog = transformationCatalog;
        this.inputBlockIds = inputBlockIds;
        this.macroParameters = macroParameters;
        this.name = name;
        this.connectedSourceNodeIds = connectedSourceNodeIds;
        this.connectedTargetNodeIds = connectedTargetNodeIds;
    }
}