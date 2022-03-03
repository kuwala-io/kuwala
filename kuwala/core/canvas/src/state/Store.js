import { createStore } from 'easy-peasy';

import CanvasModel from './models/CanvasModel';
import CommonModel from './models/CommonModel';

const storeModel = {
    common: CommonModel,
    canvas: CanvasModel,
};

const Store = createStore(storeModel);

export default Store;
