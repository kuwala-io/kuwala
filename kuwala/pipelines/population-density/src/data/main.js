require('dotenv').config({ path: `config/env/.env.${process.env.NODE_ENV}` });
const mongoose = require('mongoose');
const readlineSync = require('readline-sync');
const Kepler = require('./kepler');
const Processor = require('./processor');

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

connectDb()
    .then(async () => {
        try {
            let correctInput = false;

            while (!correctInput) {
                const option = readlineSync.keyInSelect(
                    [
                        'Data - Process population data',
                        'Map - Generate file for Kepler'
                    ],
                    'What do you want to do?'
                );

                switch (option) {
                    case -1:
                        process.exit();
                        break;
                    case 0:
                        correctInput = true;

                        await Processor.start();
                        break;
                    case 1:
                        correctInput = true;

                        await Kepler.createCSV();
                        break;
                    default:
                        console.error('Wrong input. Please try again!');
                }
            }
        } catch (error) {
            console.error(error);
        }

        process.exit();
    })
    .catch((error) => {
        console.error(error);
    });
