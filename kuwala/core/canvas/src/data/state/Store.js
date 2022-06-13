import { createStore } from 'easy-peasy';

import CanvasModel from './models/CanvasModel';
import CommonModel from './models/CommonModel';
import ConfirmationDialogModel from './models/ConfirmationDialogModel';
import DataBlockModel from './models/DataBlockModel';
import DataSourceModel from "./models/DataSourceModel";
import TransformationBlockModel from './models/TransformationBlockModel';

const storeModel = {
    canvas: CanvasModel,
    common: CommonModel,
    confirmationDialog: ConfirmationDialogModel,
    dataBlocks: DataBlockModel,
    dataSources: DataSourceModel,
    transformationBlocks: TransformationBlockModel
};

const Store = createStore(storeModel);

export default Store;
