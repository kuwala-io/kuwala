const csv = require('csv-parser');
const csvString = require('csv-string');
const readline = require('readline');
const fs = require('fs');
const streamLength = require('stream-length');
const h3 = require('h3-js');
const zlib = require('zlib');
const h3Config = require('../../../../config/h3');
const { TmpCell } = require('../../../models');

async function getSeparator(file) {
    const lineReader = readline.createInterface({
        input: fs.createReadStream(file).pipe(zlib.createGunzip())
    });

    return new Promise((resolve) => {
        lineReader.on('line', (line) => {
            resolve(csvString.detect(line));
            lineReader.close();
        });
    });
}

async function load(file, populationType, multiBar) {
    return new Promise(async (resolve, reject) => {
        try {
            const separator = await getSeparator(file);
            let data = [];
            let stream = fs.createReadStream(file);
            // noinspection JSVoidFunctionReturnValueUsed
            const size = await streamLength(stream);
            let processedSize = 0;

            const bar = multiBar.create(size, 0, { file });

            let line = 0;
            stream = stream
                .on('data', (chunk) => {
                    processedSize += chunk.length;

                    bar.update(processedSize);
                })
                .pipe(zlib.createGunzip())
                .pipe(
                    csv({
                        headers: ['lat', 'lng', 'population'],
                        skipLines: 1,
                        mapValues: ({ value }) => Number(value),
                        separator
                    })
                )
                .on('data', ({ lat, lng, population }) => {
                    line += 1;

                    const h3Index = h3.geoToH3(
                        lat,
                        lng,
                        h3Config.DEFAULT_RESOLUTION
                    );

                    if (h3Index === null) {
                        console.warn(
                            `H3Index not found for data at line ${line}: ${JSON.stringify(
                                { lat, lng, population },
                                0,
                                null
                            )} - this data will be excluded`
                        );

                        return;
                    }

                    data.push({
                        h3Index,
                        [populationType]: population
                    });

                    if (data.length === 1000) {
                        stream.pause();
                    }
                })
                .on('pause', async () => {
                    // No await to increase speed. On 'end' awaits so that all insertions are completed
                    TmpCell.insertMany([...data], { lean: true }).catch(
                        (error) => {
                            bar.stop();

                            return reject(error);
                        }
                    );
                    data = [];

                    stream.resume();
                })
                .on('error', (error) => {
                    bar.stop();

                    return reject(error);
                })
                .on('end', async () => {
                    await TmpCell.insertMany(data);
                    bar.stop();

                    return resolve();
                });

            return stream;
        } catch (error) {
            return reject(error);
        }
    });
}

module.exports = {
    load
};
