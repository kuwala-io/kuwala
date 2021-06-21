const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');
const CsvLoader = require('./csvLoader');
const Mongo = require('./mongo');
const { CountryPicker } = require('../../utils');

async function recursiveGetFiles(dir) {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    const files = await Promise.all(
        dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? recursiveGetFiles(res) : res;
        })
    );

    return files.flat();
}

function basename(filePath) {
    return filePath.split('/').reverse()[0];
}

function getFiles(country) {
    const filesPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'tmp',
        'countries',
        country,
        'population'
    );

    return recursiveGetFiles(filesPath)
        .then((files) =>
            files
                .filter((file) => file.endsWith('.csv.gz'))
                .map((file) => {
                    const fileBasename = basename(file);

                    if (
                        fileBasename.toLowerCase().includes('total_population')
                    ) {
                        return { path: file, type: 'total_population' };
                    }

                    if (
                        fileBasename.toLowerCase().includes('women') &&
                        !fileBasename
                            .toLowerCase()
                            .includes('women_of_reproductive_age_15_49')
                    ) {
                        return { path: file, type: 'women' };
                    }

                    if (fileBasename.toLowerCase().includes('_men')) {
                        return { path: file, type: 'men' };
                    }

                    if (
                        fileBasename
                            .toLowerCase()
                            .includes('children_under_five')
                    ) {
                        return { path: file, type: 'children_under_five' };
                    }

                    if (fileBasename.toLowerCase().includes('youth_15_24')) {
                        return { path: file, type: 'youth_15_24' };
                    }

                    if (
                        fileBasename.toLowerCase().includes('elderly_60_plus')
                    ) {
                        return { path: file, type: 'elderly_60_plus' };
                    }

                    if (
                        fileBasename
                            .toLowerCase()
                            .includes('women_of_reproductive_age_15_49')
                    ) {
                        return {
                            path: file,
                            type: 'women_of_reproductive_age_15_49'
                        };
                    }

                    return undefined;
                })
        )
        .then((files) => files.filter((file) => file))
        .catch((e) => console.error(e));
}

async function start() {
    return new Promise(async (resolve, reject) => {
        try {
            const country = await CountryPicker.pick();
            const progressBar = new cliProgress.MultiBar(
                {
                    clearOnComplete: false,
                    hideCursor: false,
                    forceRedraw: true,
                    format:
                        '[{bar}] {percentage}% | Duration: {duration_formatted} | ETA: {eta_formatted} | {file}',
                    etaBuffer: 10000
                },
                cliProgress.Presets.shades_grey
            );

            console.info('Loading and parsing CSV files');

            const files = await getFiles(country);

            // Sequential execution to keep memory usage low and increase speed
            for (let i = 0; i < files.length; i += 1) {
                await CsvLoader.load(files[i].path, files[i].type, progressBar);
            }

            progressBar.stop();

            await Mongo.mapReduceTmpCells();

            return resolve();
        } catch (error) {
            return reject(error);
        }
    });
}

module.exports = {
    start
};
