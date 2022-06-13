export function getDataSourceDTOById ({ dataSources, id }) {
    return dataSources.find((el) =>  el.id === id);
}