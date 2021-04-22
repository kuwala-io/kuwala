const cliProgress = require('cli-progress');
const fs = require('fs');
const level = require('level');
const parseOSM = require('osm-pbf-parser');
const rimraf = require('rimraf');
const { Transform, Writable } = require('stream');
const {
    buildingFootprintStream,
    h3Stream,
    locationStream,
    modelStream,
    tagFilterStream
} = require('../poiParser');
const { Poi } = require('../../../models');

let pois = [];
let addedObjects = 0;

function levelDbStream(db) {
    return new Transform({
        objectMode: true,
        async transform(chunk, encoding, callback) {
            await db.batch(
                chunk
                    .filter((item) => item.type === 'node')
                    .map((item) => {
                        return {
                            type: 'put',
                            key: item.id,
                            value: `${item.lon.toFixed(7)},${item.lat.toFixed(
                                7
                            )}`
                        };
                    })
            );

            this.push(chunk);

            callback();
        }
    });
}

function mongodbStream(bar) {
    return new Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
            chunk.forEach((poi) => pois.push(poi));

            if (pois.length >= 1000) {
                Poi.insertMany([...pois]).catch((e) => {
                    throw e;
                });

                addedObjects += pois.length;

                bar.update(0, { addedObjects });

                pois = [];
            }

            callback();
        }
    });
}

async function parseFile(file) {
    return new Promise(async (resolve, reject) => {
        const levelDbPath = 'tmp/levelDb';
        const bar = new cliProgress.SingleBar(
            {
                format:
                    'Running: {duration_formatted} - {addedObjects} objects added'
            },
            cliProgress.Presets.shades_classic
        );

        try {
            const db = await level(levelDbPath);
            const pbfParserStream = parseOSM();
            const stream = fs.createReadStream(file);

            bar.start(1, 0, { addedObjects });

            stream
                .pipe(pbfParserStream)
                .pipe(levelDbStream(db)) // Store every node in temporary database to generate building footprints
                .pipe(tagFilterStream) // Filter irrelevant items
                .pipe(buildingFootprintStream(db)) // Construct building footprints for ways and relations
                .pipe(locationStream) // Get lat lng pair for center based on point or building footprint
                .pipe(h3Stream) // Convert location to h3 index
                .pipe(modelStream) // Create model objects
                .pipe(mongodbStream(bar)) // Save objects to mongodb
                .on('finish', async () => {
                    await Poi.insertMany(pois).catch(reject);
                    await db.close();
                    rimraf.sync(levelDbPath);
                    bar.stop();

                    resolve();
                })
                .on('error', (error) => {
                    rimraf.sync(levelDbPath);
                    bar.stop();
                    reject(error);
                });
        } catch (error) {
            rimraf.sync(levelDbPath);
            bar.stop();
            reject(error);
        }
    });
}

module.exports = {
    parseFile
};
