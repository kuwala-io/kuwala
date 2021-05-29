// noinspection DuplicatedCode,JSCheckFunctionSignatures

require('dotenv').config({ path: `config/env/.env.${process.env.NODE_ENV}` });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger');
const { Middlewares } = require('../../../shared/js');
const { geojson, radius } = require('./routes');

const app = express();

app.use(cors());
app.use(pino());
app.use(bodyParser.json({ limit: '1MB' }));
app.use('/geojson', geojson);
app.use('/radius', radius);
app.use(Middlewares.handleErrors);

async function connectDb() {
    const { MONGO_HOST, MONGO_PORT, MONGO_DATABASE } = process.env;
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    };

    return mongoose.connect(
        `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`,
        options
    );
}

connectDb().then(() => {
    const { API_PORT } = process.env;

    app.listen(API_PORT, () => {
        console.info(`REST API listening on port ${API_PORT}`);
    });
});

module.exports = app;
