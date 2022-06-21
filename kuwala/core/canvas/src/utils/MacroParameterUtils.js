import moment from "moment";

export function mapParametersForUpsert (param) {
    let value = param.value;

    if (param.type === 'date') {
        value = moment(param.value).format('YYYY-MM-DD')
    } else if (param.id === 'aggregated_columns') {
        value = param.value.map(({ column, aggregation }) => `${column}KUWALA_AGG${aggregation}`);
    } else if (param.type === 'list[text]') {
        value = ['']
    }

    return { ...param, value };
}