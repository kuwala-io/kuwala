require('dotenv').config({ path: `config/env/.env.${process.env.NODE_ENV}` });
const mongoose = require('mongoose');
const { start } = require('./processor');

const connectDb = async () => {
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
};

connectDb()
    .then(async () => {
        await start();
        process.exit();
    })
    .catch((error) => {
        console.error(error);

        process.exit();
    });
