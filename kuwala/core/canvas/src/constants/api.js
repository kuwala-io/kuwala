const BASE_URL = process.env.REACT_APP_BASE_BACKEND || 'http://localhost:8000';

export const DATA_CATALOG = BASE_URL + '/data-catalog';
export const SELECT_DATA_CATALOG = DATA_CATALOG + '/select';
export const DATA_SOURCE = BASE_URL + '/data-source';
export const DATA_BLOCK = BASE_URL + '/block/data';
export const TRANSFORMATION_CATALOG = BASE_URL + '/transformation-catalog';
export const TRANSFORMATION_CATALOG_CATEGORY = TRANSFORMATION_CATALOG + '/category';
export const EXPORT_CATALOG = BASE_URL + '/export-catalog';
export const EXPORT_CATALOG_CATEGORY = EXPORT_CATALOG + '/category';
export const TRANSFORMATION_BLOCK = BASE_URL + '/block/transformation';
export const EXPORT_BLOCK = BASE_URL + '/block/export';
export const BLOCK = BASE_URL + '/block';