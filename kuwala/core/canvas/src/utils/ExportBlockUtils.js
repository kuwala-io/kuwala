import ExportBlockDTO from "../data/dto/ExportBlockDTO";

export function fromAPIResponseToExportBlockDTO ({exportBlockResponse, exportCatalogItem}) {
    const dto = new ExportBlockDTO({
        exportCatalogItem,
        name: exportBlockResponse.name,
        connectedSourceNodeIds: [],
        exportBlockId: exportBlockResponse.id,
        connectedTargetNodeIds: [],
        isConfigured: true,
        macroParameters: exportBlockResponse.macro_parameters,
        exportCatalogItemId: exportBlockResponse.export_catalog_item_id,
        exportBlockEntityId: exportBlockResponse.id,
        columns: exportBlockResponse.columns,
        positionX: exportBlockResponse.position_x,
        positionY: exportBlockResponse.position_y,
        inputBlockIds: exportBlockResponse.input_block_ids,
    });
    dto.macroParameters = exportCatalogItem.macroParameters.map((el) => {
        return {
            ...el,
            value: getParameterValue(el.id, dto.macroParameters)
        }
    })
    return dto
}

function getParameterValue (parameterId, dtoMacroParameters) {
    let element = dtoMacroParameters.find(p => p.id === parameterId);

    return element.value;
}