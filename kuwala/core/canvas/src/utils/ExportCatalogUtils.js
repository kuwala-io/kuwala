import {getAllItemsInCategory, getAllTransformationCatalogCategories} from "../api/TransformationCatalog";

import ExportCatalogDTO from "../data/dto/ExportCatalogDTO";

export function getExportCatalogById ({exportCatalog, id}) {
    return exportCatalog.find((el) =>  el.id === id);
}

export function convertExportCatalogResponseToDTO (catalogResponse) {
    const dto = new ExportCatalogDTO({
        id: catalogResponse.id,
        category: catalogResponse.category,
        name: catalogResponse.name,
        icon: catalogResponse.icon,
        description: catalogResponse.description,
        minNumberOfInputBlocks: catalogResponse.min_number_of_input_blocks,
        maxNumberOfInputBlocks: catalogResponse.max_number_of_input_blocks,
        macroParameters: catalogResponse.macro_parameters,
        categoryIcon: catalogResponse.category_icon,
    });
    return dto;
}