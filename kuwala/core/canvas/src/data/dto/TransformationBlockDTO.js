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
        name
     }) {
        this.transformationBlockId = transformationBlockId;
        this.transformationBlockEntityId = transformationBlockEntityId;
        this.isConfigured = isConfigured;
        this.transformationCatalogItemId = transformationCatalogItemId;
        this.transformationCatalog = transformationCatalog;
        this.inputBlockIds = inputBlockIds;
        this.macroParameters = macroParameters;
        this.name = name;
    }
}