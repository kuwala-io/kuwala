module.exports = class ExportCatalogDTO {
    constructor
    ({
         id,
         category,
         name,
         icon,
         description,
         minNumberOfInputBlocks,
         maxNumberOfInputBlocks,
         macroParameters,
         categoryIcon
     }) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.icon = icon;
        this.categoryIcon = categoryIcon;
        this.description = description;
        this.minNumberOfInputBlocks = minNumberOfInputBlocks;
        this.maxNumberOfInputBlocks = maxNumberOfInputBlocks;
        this.macroParameters = macroParameters;
    }
}