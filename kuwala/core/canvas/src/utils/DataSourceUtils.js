export function getDataSourceDTOById ({dataSource, id}) {
    return dataSource.find((el) =>  el.id === id);
}