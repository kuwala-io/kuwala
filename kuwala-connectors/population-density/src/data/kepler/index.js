const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cliProgress = require('cli-progress');
const { Cell } = require('../../models');
const { CountryPicker } = require('../../utils');

async function createCSV() {
    return new Promise(async (resolve, reject) => {
        try {
            const progressBar = new cliProgress.SingleBar(
                {
                    clearOnComplete: false,
                    hideCursor: false,
                    forceRedraw: true,
                    format: 'Creating CSV for Kepler… {duration_formatted}',
                    etaBuffer: 10000
                },
                cliProgress.Presets.shades_grey
            );
            const country = await CountryPicker.pick();

            progressBar.start(1, 0);

            const results = await Cell.aggregate([
                {
                    $project: {
                        _id: 0,
                        hex_id: '$_id',
                        total_population: '$population.total_population',
                        women: '$population.women',
                        men: '$population.men',
                        children_under_five: '$population.children_under_five',
                        youth_15_24: '$population.youth_15_24',
                        elderly_60_plus: '$population.elderly_60_plus',
                        women_of_reproductive_age_15_49:
                            '$population.women_of_reproductive_age_15_49'
                    }
                }
            ]);
            const csvWriter = createCsvWriter({
                path: `tmp/countries/${country}/kepler/kepler${country.toUpperCase()}.csv`,
                header: [
                    { id: 'hex_id', title: 'hex_id' },
                    { id: 'total_population', title: 'total_population' },
                    { id: 'women', title: 'women' },
                    { id: 'men', title: 'men' },
                    { id: 'children_under_five', title: 'children_under_five' },
                    { id: 'youth_15_24', title: 'youth_15_24' },
                    { id: 'elderly_60_plus', title: 'elderly_60_plus' },
                    {
                        id: 'women_of_reproductive_age_15_49',
                        title: 'women_of_reproductive_age_15_49'
                    }
                ],
                fieldDelimiter: ','
            });

            await csvWriter.writeRecords(results);

            progressBar.stop();

            return resolve();
        } catch (error) {
            return reject(error);
        }
    });
}

module.exports = {
    createCSV
};
