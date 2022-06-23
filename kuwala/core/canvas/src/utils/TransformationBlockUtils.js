import TransformationBlockDTO from "../data/dto/TransformationBlockDTO";

export function fromAPIResponseToTransformationBlockDTO ({transformationBlockResponse, transformationCatalogItem}) {
    const dto = new TransformationBlockDTO({
        transformationCatalogItem,
        name: transformationBlockResponse.name,
        connectedSourceNodeIds: [],
        transformationBlockId: transformationBlockResponse.id,
        connectedTargetNodeIds: [],
        isConfigured: true,
        macroParameters: transformationBlockResponse.macro_parameters,
        transformationCatalogItemId: transformationBlockResponse.transformation_catalog_item_id,
        transformationBlockEntityId: transformationBlockResponse.id,
        materializeTable: transformationBlockResponse.materialize_as_table,
        columns: transformationBlockResponse.columns,
        positionX: transformationBlockResponse.position_x,
        positionY: transformationBlockResponse.position_y,
        inputBlockIds: transformationBlockResponse.input_block_ids,
    });
    dto.macroParameters = transformationCatalogItem.macroParameters.map((el) => {
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