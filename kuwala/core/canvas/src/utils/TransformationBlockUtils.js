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
    dto.macroParameters = dto.macroParameters.map((el) => {
        return {
            ...el,
            name: getParameterName(el.id, transformationCatalogItem)
        }
    })
    return dto
}

function getParameterName (parameterId, transformationCatalogItem) {
    let parameter = transformationCatalogItem.macroParameters.find(p => p.id === parameterId);

    return parameter.name;
}