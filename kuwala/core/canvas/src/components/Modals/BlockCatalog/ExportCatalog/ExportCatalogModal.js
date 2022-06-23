import React, {Fragment, useCallback, useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import ExportCatalogDTO from "../../../../data/dto/ExportCatalogDTO";
import {getAllExportCatalogCategories, getAllItemsInExportCategory} from "../../../../api/ExportCatalog";
import ExportCatalogFooter from "./ExportCatalogFooter";
import ExportCatalogSelector from "./ExportCatalogSelector";
import ExportCatalogBody from "./ExportCatalogBody";
import ExportBlockDTO from "../../../../data/dto/ExportBlockDTO";
import {v4} from "uuid";

export default () => {
    const { toggleBlockCatalogModal } = useStoreActions(actions => actions.common);
    const [selectedExportIndex, setSelectedExportIndex] = useState(null);
    const [catalogCategories, setCatalogCategories] = useState([]);
    const [catalogOptions, setCatalogOptions] = useState([]);
    const [selectedCatalogOption, setSelectedCatalogOption] = useState(null);
    const { elements } = useStoreState(({ canvas }) => canvas);
    const { addNode, setElements } = useStoreActions(({ canvas }) => canvas);
    const {
        addExportBlock,
        convertExportBlockIntoElement
    } = useStoreActions(({ exportBlocks }) => exportBlocks);

    useEffect(() => {
        initExportCatalogs().then(null);
    }, [])

    useEffect(()=> {
        const fetchCatalogBodyItems = async (category) => {
            try{
                const categoryId = category.id;
                const res = await getAllItemsInExportCategory(categoryId);
                if(res.status === 200){
                    catalogOptionsIntoDTO(res.data, category);
                } else {
                    setCatalogOptions([]);
                }
            }catch(e) {
                console.error('Failed to get export catalog', e);
            }
        }

        if(catalogCategories.length) {
            const category = catalogCategories[selectedExportIndex]
            if(category) {
                fetchCatalogBodyItems(category).then(null);
            }
        }
    }, [selectedExportIndex, catalogCategories])

    const initExportCatalogs = async () => {
        try{
            const res = await getAllExportCatalogCategories();
            if(res.status === 200){
                setCatalogCategories(res.data);
            } else {
                setCatalogCategories([]);
            }
        }catch(e) {
            console.error('Failed to get export catalog', e);
        }
    }

    const catalogOptionsIntoDTO = (apiResponse, category) => {
        let tempOptions = [];
        apiResponse.forEach((el) => {
            const tfCatalogDTO = new ExportCatalogDTO({
                id: el.id,
                category: el.category,
                categoryIcon: category.icon,
                name: el.name,
                icon: el.icon,
                description: el.description,
                minNumberOfInputBlocks: el.min_number_of_input_blocks,
                maxNumberOfInputBlocks: el.max_number_of_input_blocks,
                macroParameters: el.macro_parameters,
            });
            tempOptions.push(tfCatalogDTO);
        });
        setCatalogOptions(tempOptions);
    }

    const addToCanvas = () => {
        const exportCatalogDTO = catalogOptions[selectedCatalogOption];

        const exportBlockDTO = new ExportBlockDTO({
            exportBlockId: v4(),
            exportBlockEntityId: null,
            isConfigured: false,
            exportCatalogItem: exportCatalogDTO,
            exportCatalogItemId: exportCatalogDTO.id,
            inputBlockIds: null,
            macroParameters: null,
            name: exportCatalogDTO.name
        });

        addExportBlock(exportBlockDTO);
        convertExportBlockIntoElement({ addNode, elements, setElements });
        toggleBlockCatalogModal();
    }

    return (
        <Fragment>
            <ExportCatalogSelector
                catalogCategories={catalogCategories}
                setSelectedCatalogOption={setSelectedCatalogOption}
                selectedExportIndex={selectedExportIndex}
                setSelectedExportIndex={setSelectedExportIndex}
            />

            <ExportCatalogBody
                selectedExportIndex={selectedExportIndex}
                setSelectedCatalogOption={setSelectedCatalogOption}
                selectedCatalogOption={selectedCatalogOption}
                catalogOptions={catalogOptions}
            />

            <ExportCatalogFooter
                toggleBlockCatalogModal={toggleBlockCatalogModal}
                selectedCatalogOption={selectedCatalogOption}
                addToCanvas={addToCanvas}
            />
        </Fragment>
    )
}