const BASE_URL = process.env.REACT_APP_BASE_BACKEND || 'http://localhost:8000';

export const DATA_CATALOG = BASE_URL + '/data-catalog';
export const SELECT_DATA_CATALOG = DATA_CATALOG + '/select';
export const DATA_SOURCE = BASE_URL + '/data-source'
export const DATA_BLOCK = BASE_URL + '/block/data'