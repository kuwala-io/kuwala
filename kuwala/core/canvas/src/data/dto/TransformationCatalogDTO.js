module.exports = class TransformationBlockDTO {
    constructor
    ({
         id,
         category,
         name,
         icon,
         description,
         requiredColumnTypes,
         optionalColumnTypes,
         minNumberOfInputBlocks,
         maxNumberOfInputBlocks,
         macroParameters,
         examplesBefore,
         examplesAfter,
         categoryIcon
     }) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.icon = icon;
        this.categoryIcon = categoryIcon;
        this.description = description;
        this.requiredColumnTypes = requiredColumnTypes;
        this.optionalColumnTypes = optionalColumnTypes;
        this.minNumberOfInputBlocks = minNumberOfInputBlocks;
        this.maxNumberOfInputBlocks = maxNumberOfInputBlocks;
        this.macroParameters = macroParameters;
        this.examplesBefore = examplesBefore;
        this.examplesAfter = examplesAfter;
    }
}