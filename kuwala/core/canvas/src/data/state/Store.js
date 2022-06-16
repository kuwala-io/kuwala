import { createStore } from 'easy-peasy';

import CanvasModel from './models/CanvasModel';
import CommonModel from './models/CommonModel';
import ConfirmationDialogModel from './models/ConfirmationDialogModel';
import DataBlockModel from './models/DataBlockModel';
import DataSourceModel from "./models/DataSourceModel";
import TransformationBlockModel from './models/TransformationBlockModel';
import ExportBlockModel from './models/ExportBlockModel';

const storeModel = {
    canvas: CanvasModel,
    common: CommonModel,
    confirmationDialog: ConfirmationDialogModel,
    dataBlocks: DataBlockModel,
    dataSources: DataSourceModel,
    transformationBlocks: TransformationBlockModel,
    exportBlocks: ExportBlockModel,
};

const Store = createStore(storeModel);

export default Store;
