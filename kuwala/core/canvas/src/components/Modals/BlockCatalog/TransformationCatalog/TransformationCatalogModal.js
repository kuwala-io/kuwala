import React, {Fragment, useEffect, useState} from "react";
import {useStoreActions} from "easy-peasy";
import {
    getAllTransformationCatalogCategories,
    getAllItemsInCategory
} from "../../../../api/TransformationCatalog";
import "./transformation-example-table.css";
import TransformationBlockDTO from "../../../../data/dto/TransformationBlockDTO";
import TransformationCatalogDTO from "../../../../data/dto/TransformationCatalogDTO";
import {v4} from "uuid";
import TransformationCatalogFooter from "./TransformationCatalogFooter";
import TransformationCatalogSelector from "./TransformationCatalogSelector";
import TransformationCatalogBody from "./TransformationCatalogBody";

export default () => {
    const { toggleBlockCatalogModal } = useStoreActions(actions => actions.common);
    const { convertTransformationBlockIntoElement, addTransformationBlock } = useStoreActions(actions => actions.canvas);
    const [selectedTransformationIndex, setSelectedTransformationIndex] = useState(null);
    const [catalogCategories, setCatalogCategories] = useState([]);
    const [catalogOptions, setCatalogOptions] = useState([]);
    const [selectedCatalogOption, setSelectedCatalogOption] = useState(null);

    useEffect(() => {
        initTransformationCatalogs().then(null);
    }, [])

    useEffect(()=> {
        const fetchCatalogBodyItems = async (category) => {
            try{
                const transformationId = category.id;
                const res = await getAllItemsInCategory(transformationId);
                if(res.status === 200){
                    catalogOptionsIntoDTO(res.data, category);
                } else {
                    setCatalogOptions([]);
                }
            }catch(e) {
                console.error('Failed to get transformation catalog', e);
            }
        }

        if(catalogCategories.length) {
            const category = catalogCategories[selectedTransformationIndex]
            fetchCatalogBodyItems(category).then(null);
        }
    }, [selectedTransformationIndex, catalogCategories])

    const initTransformationCatalogs = async () => {
        try{
            const res = await getAllTransformationCatalogCategories();
            if(res.status === 200){
                setCatalogCategories(res.data);
            } else {
                setCatalogCategories([]);
            }
        }catch(e) {
            console.error('Failed to get transformation catalog', e);
        }
    }

    const addToCanvas = async () => {
        const tfCatalogDTO = catalogOptions[selectedCatalogOption];

        const tfBlockDTO = new TransformationBlockDTO({
            transformationBlockId: v4(),
            transformationBlockEntityId: null,
            isConfigured: false,
            transformationCatalogItemId: tfCatalogDTO.id,
            transformationCatalog: tfCatalogDTO,
            inputBlockIds: null,
            macroParameters: null,
            name: tfCatalogDTO.name,
        });

        addTransformationBlock(tfBlockDTO);
        convertTransformationBlockIntoElement();
        toggleBlockCatalogModal();
    }

    const catalogOptionsIntoDTO = (apiResponse, category) => {
        let tempOptions = [];
        apiResponse.forEach((el) => {
            const tfCatalogDTO = new TransformationCatalogDTO({
                id: el.id,
                category: el.category,
                categoryIcon: category.icon,
                name: el.name,
                icon: el.icon,
                description: el.description,
                requiredColumnTypes: el.required_column_types,
                optionalColumnTypes: el.optional_column_types,
                minNumberOfInputBlocks: el.min_number_of_input_blocks,
                maxNumberOfInputBlocks: el.max_number_of_input_blocks,
                macroParameters: el.macro_parameters,
                examplesAfter: el.examples_after,
                examplesBefore: el.examples_before,
            });
            tempOptions.push(tfCatalogDTO);
        });
        setCatalogOptions(tempOptions);
    }

    return (
        <Fragment>
            <TransformationCatalogSelector
                setSelectedCatalogOption={setSelectedCatalogOption}
                catalogCategories={catalogCategories}
                selectedTransformationIndex={selectedTransformationIndex}
                setSelectedTransformationIndex={setSelectedTransformationIndex}
            />

            <TransformationCatalogBody
                selectedTransformationIndex={selectedTransformationIndex}
                setSelectedCatalogOption={setSelectedCatalogOption}
                selectedCatalogOption={selectedCatalogOption}
                catalogOptions={catalogOptions}
            />

            <TransformationCatalogFooter
                selectedCatalogOption={selectedCatalogOption}
                toggleBlockCatalogModal={toggleBlockCatalogModal}
                addToCanvas={async () => {
                    await addToCanvas()
                }}
            />
        </Fragment>
    )
}