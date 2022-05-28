import React, {Fragment, useCallback, useEffect, useState} from "react";
import {useStoreActions} from "easy-peasy";
import ExportCatalogDTO from "../../../../data/dto/ExportCatalogDTO";
import {getAllExportCatalogCategories, getAllItemsInExportCategory} from "../../../../api/ExportCatalog";
import ExportCatalogFooter from "./ExportCatalogFooter";
import ExportCatalogSelector from "./ExportCatalogSelector";
import ExportCatalogBody from "./ExportCatalogBody";

export default () => {
    const { toggleBlockCatalogModal } = useStoreActions(actions => actions.common);
    const [selectedExportIndex, setSelectedExportIndex] = useState(null);
    const [catalogCategories, setCatalogCategories] = useState([]);
    const [catalogOptions, setCatalogOptions] = useState([]);
    const [selectedCatalogOption, setSelectedCatalogOption] = useState(null);

    useEffect(() => {
        initExportCatalogs().then(null);
    }, [])

    useEffect(()=> {
        if(catalogCategories.length) {
            const category = catalogCategories[selectedExportIndex]
            fetchCatalogBodyItems(category).then(null);
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
            />
        </Fragment>
    )
}