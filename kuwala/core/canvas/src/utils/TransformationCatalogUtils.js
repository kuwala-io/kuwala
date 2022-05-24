import {getAllItemsInCategory, getAllTransformationCatalogCategories} from "../api/TransformationCatalog";

import TransformationCatalogDTO from "../data/dto/TransformationCatalogDTO";

export function getTransformationCatalogById ({transformationCatalog, id}) {
    return transformationCatalog.find((el) =>  el.id === id);
}

export function convertTransformationCatalogResponseToDTO (catalogResponse) {
    const dto = new TransformationCatalogDTO({
        id: catalogResponse.id,
        category: catalogResponse.category,
        name: catalogResponse.name,
        icon: catalogResponse.icon,
        description: catalogResponse.description,
        requiredColumnTypes: catalogResponse.required_column_types,
        optionalColumnTypes: catalogResponse.optional_column_types,
        minNumberOfInputBlocks: catalogResponse.min_number_of_input_blocks,
        maxNumberOfInputBlocks: catalogResponse.max_number_of_input_blocks,
        macroParameters: catalogResponse.macro_parameters,
        examplesBefore: catalogResponse.exaples_before,
        examplesAfter: catalogResponse.exaples_after,
        categoryIcon: catalogResponse.category_icon,
    });
    return dto;
}