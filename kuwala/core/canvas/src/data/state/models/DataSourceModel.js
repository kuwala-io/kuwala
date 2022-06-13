import {action, thunk} from "easy-peasy";
import {getDataSource} from "../../../api/DataSourceApi";
import DataSourceDTO from "../../dto/DataSourceDTO";
import {getAllDataCatalogItems, saveSelectedDataCatalogItems} from "../../../api/DataCatalogApi";

const DataSourceModel = {
    dataSources: [],
    availableDataSources: [],
    fetchedDataSources: false,
    loadingDataSources: false,
    savingDataSources: false,
    selectedDataSources: [],
    selectedDataSourcesCanvas: [],
    setDataSources: action((state, dataSources) => {
        state.dataSources = dataSources;
    }),
    setLoadingDataSources: action((state, loadingDataSources) => {
        state.loadingDataSources = loadingDataSources;
    }),
    setFetchedDataSources: action((state, fetchedDataSources) => {
        state.fetchedDataSources = fetchedDataSources;
    }),
    setSavingDataSources: action((state, savingDataSources) => {
        state.savingDataSources = savingDataSources;
    }),
    getDataSources: thunk(async (
        { getAvailableDataSources, setDataSources, setFetchedDataSources, setLoadingDataSources },
        params,
        {getState}
    ) => {
        setLoadingDataSources(true);

        const result = await getDataSource();

        await getAvailableDataSources();

        const { availableDataSources } = getState();
        const DTOs = [];

        result.data.forEach(({ connected, connection_parameters, data_catalog_item_id, id }) => {
            const index = availableDataSources.findIndex((e) => e.id === data_catalog_item_id);
            const dto = new DataSourceDTO({
                id,
                dataCatalogItemId: data_catalog_item_id,
                connectionParameters: connection_parameters,
                logo: availableDataSources[index].logo,
                name: availableDataSources[index].name,
                connected,
            });

            DTOs.push(dto);
        });

        setDataSources(DTOs);
        setFetchedDataSources(true);
        setLoadingDataSources(false);
    }),
    setAvailableDataSources: action((state, availableDataSources) => {
        state.availableDataSources = availableDataSources;
    }),
    getAvailableDataSources: thunk(async ({ setAvailableDataSources}) => {
        const response = await getAllDataCatalogItems();
        let data = [];

        if (response.status === 200) {
            data = response.data;
        }

        setAvailableDataSources(data);
    }),
    setSelectedSources: action((state, newSelectedSources) => {
        state.selectedDataSources = newSelectedSources
    }),
    saveSelectedSources: thunk(async (
        { getDataSources, setSavingDataSources  },
        params,
        { getState }
    ) => {
        setSavingDataSources(true);

        const { selectedDataSources } = getState();

        if (!selectedDataSources.length) {
            console.error("No data sources selected")

            return;
        }

        const idList = selectedDataSources.map((el) => el.id);

        await saveSelectedDataCatalogItems({
            item_ids: idList
        });
        await getDataSources();
        setSavingDataSources(false);
    }),
    addDataSourceToCanvas: action((state, selectedDataSource) => {
        let dup = false;

        state.selectedDataSourcesCanvas.forEach((el) => {
            if (el.id === selectedDataSource.id) dup = true;
        });

        if (dup) return

        state.selectedDataSourcesCanvas = [...state.selectedDataSourcesCanvas, selectedDataSource]
    }),
}

export default DataSourceModel;
