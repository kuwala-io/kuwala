import React, {useEffect, useState} from "react";
import {useStoreActions} from "easy-peasy";
import {
    getAllTransformationCatalog,
    getAllItemsFromTransformationCategories
} from "../../../api/TransformationCatalog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShuffle} from "@fortawesome/free-solid-svg-icons";
import {getCatalogItemIcon} from "../../../utils/TransformationCatalogUtils";
import {getDataDictionary} from "../../../utils/SchemaUtils";
import ReactTable from "react-table-6";
import "./transformation-example-table.css";
import {ModalBase, ModalBody, ModalCloseButton, ModalFooter, ModalHeader} from "../ModalBase";
import {ButtonBase} from "../../Button";

const ExampleTable = ({columns, rows}) => {
    let populatedColumns = columns.map((el,i)=>{
        return {
            Header: el,
            accessor: el,
        }
    });

    populatedColumns = [{
        Header: "",
        id: "row",
        filterable: false,
        width: 50,
        Cell: (row) => {
            return <div>{row.index+1}</div>;
        }
    }, ...populatedColumns]

    const populatedRows = getDataDictionary(rows, columns);

    return (
        <div className={'transformation-example h-full'}>
            <ReactTable
                data={populatedRows}
                columns={populatedColumns}
                defaultPageSize={3}
                showPagination={false}
                showPaginationTop={false}
                showPaginationBottom={false}
                showPageSizeOptions={false}
                style={{
                    height: "100%",
                }}
            />
        </div>
    )
}

export default ({isShow}) => {
    const { toggleTransformationCatalogModal } = useStoreActions(actions => actions.common);
    const [selectedTransformationIndex, setSelectedTransformationIndex] = useState(null);
    const [catalogCategories, setCatalogCategories] = useState([]);
    const [catalogOptions, setCatalogOptions] = useState([]);
    const [selectedCatalogOption, setSelectedCatalogOption] = useState(null);

    useEffect(() => {
        initTransformationCatalogs().then(null);
    }, [])

    useEffect(()=> {
        if(catalogCategories.length > 0) {
            const tfId = catalogCategories[selectedTransformationIndex].id
            fetchCatalogBodyItems(tfId).then(null);
        }
    }, [selectedTransformationIndex])

    const initTransformationCatalogs = async () => {
        try{
            const res = await getAllTransformationCatalog();
            if(res.status === 200){
                setCatalogCategories(res.data);
            } else {
                setCatalogCategories([]);
            }
        }catch(e) {
            console.error('Failed to get transformation catalog', e);
        }
    }

    const fetchCatalogBodyItems = async (transformationId) => {
        try{
            const res = await getAllItemsFromTransformationCategories(transformationId);
            if(res.status === 200){
                setCatalogOptions(res.data);
            } else {
                setCatalogOptions([]);
            }
        }catch(e) {
            console.error('Failed to get transformation catalog', e);
        }
    }

    const CatalogSelector = () => {
        return (
            <div className={'flex flex-col w-full'}>
                <div className={'flex flex-row w-64 space-x-4 items-center px-4 py-3 bg-kuwala-green text-white rounded-lg'}>
                    <FontAwesomeIcon
                        icon={faShuffle}
                        className={'h-6 w-6'}
                    />
                    <span className={'font-semibold'}>Transformation Blocks</span>
                </div>

                <div className={'flex flex-row space-x-4 items-center mt-4'}>
                    {renderCatalogList()}
                </div>
            </div>
        )
    }

    const renderCatalogList = () => {
        if(catalogCategories.length > 0) {
            return catalogCategories.map((el, index) => renderCatalogItem(el, index))
        }
    }

    const renderCatalogItem = (catalogItem,index) => {
        return (
            <div
                className={`
                    px-4 py-2 border rounded-md border-kuwala-red space-x-2
                    ${selectedTransformationIndex == index ? 'bg-kuwala-red text-white' : 'bg-white text-kuwala-red'} 
                    hover:bg-kuwala-red hover:text-white cursor-pointer
                `}
                onClick={()=>{
                    setSelectedCatalogOption(null);
                    setSelectedTransformationIndex(index)
                }}
            >
                {getCatalogItemIcon(catalogItem.icon)}
                <span className={'font-semibold'}>
                    {catalogItem.name}
                </span>
            </div>
        )
    }

    const CatalogBody = () => {
        return (
            <>
                {
                    selectedTransformationIndex !== null
                    ?
                        <SelectedTransformationCatalog/>
                    :
                        <div className="flex flex-col w-full h-full text-xl font-light justify-center items-center rounded-tr-lg">
                            <p>To pick a transformation block,</p>
                            <p>select a transformation <span className={'text-kuwala-red'}>category</span> first</p>
                        </div>
                }
            </>
        )
    }

    const SelectedTransformationCatalog = () => {
        if (!selectedTransformationIndex || catalogOptions.length === 0) {
            return (
                <div>
                    No <span className={'text-kuwala-red'}>transformation</span> options found.
                </div>
            )
        } else {
            return (
                <div className={'flex flex-row bg-white h-full w-full'}>
                    <div className={'flex flex-col bg-white w-3/12 h-full space-y-3 mr-4'}>
                        {renderTransformationOptions(catalogOptions)}
                    </div>
                    <div className={'flex flex-col bg-white w-9/12 rounded-tr-lg'}>
                        <div className={'flex flex-col w-full h-full'}>
                            {renderSelectedOptionDetails()}
                        </div>
                    </div>
                </div>
            )
        }
    }

    const renderTransformationOptions = (options) => {
        return options.map((el, index)=> renderOptionItem(el, index))
    }

    const renderOptionItem = (optionItem, index) => {
        return (
            <div
                className={`
                    px-4 py-2 border rounded-md border-kuwala-purple space-x-2
                    ${selectedCatalogOption === index ? 'bg-kuwala-purple text-white' : 'bg-white text-kuwala-purple'} 
                    hover:bg-kuwala-purple hover:text-white cursor-pointer
                `}
                onClick={()=>{
                    setSelectedCatalogOption(index)
                }}
            >
                {getCatalogItemIcon(optionItem.icon)}
                <span className={'font-semibold'}>
                    {optionItem.name}
                </span>
            </div>
        )
    }

    const renderSelectedOptionDetails = () => {
        if(selectedCatalogOption === null){
            return (
                <div className="flex flex-col w-full h-full text-xl font-light justify-center items-center rounded-tr-lg">
                    <p>To see the <span className={'text-kuwala-purple'}>details</span> of a transformation block,</p>
                    <p>select one from the left</p>
                </div>
            )
        } else {
            const optionItem = catalogOptions[selectedCatalogOption];

            return (
                <div className={'flex flex-col w-full h-full border-2 border-kuwala-purple rounded-lg p-6 overflow-y-auto'}>
                    <div className={'text-kuwala-purple space-x-4'}>
                        {getCatalogItemIcon(optionItem.icon)}
                        <span className={'font-semibold'}>
                            {optionItem.name}
                        </span>
                    </div>
                    <p className={'mt-2'}>
                        {optionItem.description}
                    </p>
                    <div className={'flex flex-row space-x-2 mt-6 items-center'}>
                        <span>
                            Required column types:
                        </span>
                        {renderBadgeList(optionItem.required_column_types)}
                    </div>
                    <div className={'flex flex-row space-x-2 mt-2 items-center'}>
                        <span>
                            Optional column types:
                        </span>
                        {renderBadgeList(optionItem.optional_column_types)}
                    </div>

                    <div className={'flex flex-row mt-4 h-full space-x-6'}>
                        <div className={'flex flex-col w-2/12'}>
                            <p>Parameters</p>
                            {optionItem.macro_parameters.map((el) => <li>{el.name}</li>)}
                        </div>
                        <div className={'h-full w-10/12 flex flex-col bg-kuwala-bg-gray rounded-lg p-4 overflow-y-scroll'}>
                            <span className={'text-kuwala-purple font-semibold mb-2'}>
                               Before
                            </span>
                            <ExampleTable
                                columns={optionItem.examples_before[0].columns}
                                rows={optionItem.examples_before[0].rows}
                            />
                            <span className={'text-kuwala-purple font-semibold my-2'}>
                               After
                            </span>
                            <ExampleTable
                                columns={optionItem.examples_before[0].columns}
                                rows={optionItem.examples_before[0].rows}
                            />
                        </div>
                    </div>

                </div>
            )
        }
    }

    const renderBadgeList = (badgeStringList) => {
        if(typeof badgeStringList === 'undefined' || badgeStringList.length <= 0) return
        return badgeStringList.map((el) => {
            return (
                <div className={'px-2.5 py-0.5 bg-stone-200 text-gray-400 font-semibold rounded-md text-sm'}>
                    {el}
                </div>
            )
        })
    }

    return (
        <ModalBase
            isShow={isShow}
        >
            <ModalHeader>
                <ModalCloseButton
                    onClick={toggleTransformationCatalogModal}
                />
                <CatalogSelector/>
            </ModalHeader>

            <ModalBody>
                <CatalogBody/>
            </ModalBody>

            <ModalFooter>
                <div className={'flex flex-row justify-between items-center px-6 pb-4'}>
                    <ButtonBase
                        onClick={toggleTransformationCatalogModal}
                    >
                     Back
                    </ButtonBase>
                </div>
            </ModalFooter>
        </ModalBase>
    )
}