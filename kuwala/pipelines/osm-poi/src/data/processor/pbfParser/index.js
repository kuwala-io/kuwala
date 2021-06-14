const cliProgress = require('cli-progress');
const fs = require('fs');
const level = require('level');
const parseOSM = require('osm-pbf-parser');
const rimraf = require('rimraf');
const { Transform, Writable } = require('stream');
const {
    buildingFootprintStream,
    h3Stream,
    locationStream
} = require('./geoParser');
const { addUnmatchedTags, tagStream, tagFilterStream } = require('./tagParser');
const { Poi } = require('../../../models');

let pois = [];
let addedObjects = 0;

// Store nodes for building footprints in temporary database
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

// Combine parsed properties in the POI model
const modelStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        this.push(
            chunk.map(
                ({
                    id,
                    type,
                    categories,
                    tags,
                    address,
                    website,
                    email,
                    phone,
                    name,
                    h3Index,
                    buildingFootprint
                }) =>
                    new Poi({
                        osmId: id,
                        type,
                        categories,
                        address,
                        contact:
                            website || email || phone
                                ? { website, email, phone }
                                : undefined,
                        osmTags: tags,
                        name,
                        h3Index,
                        buildingFootprint
                    })
            )
        );

        callback();
    }
});

// Save POI objects to the database
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

// Parse downloaded pbf file
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
                .pipe(pbfParserStream) // Parse pbf format to JSON objects
                .pipe(levelDbStream(db)) // Store every node in temporary database to generate building footprints
                .pipe(tagFilterStream) // Filter irrelevant items
                .pipe(buildingFootprintStream(db)) // Construct building footprints for ways and relations
                .pipe(locationStream) // Get lat lng pair for center based on point or building footprint
                .pipe(h3Stream) // Convert location to h3 index
                .pipe(tagStream) // Convert relevant tags into categories and properties
                .pipe(modelStream) // Create model objects
                .pipe(mongodbStream(bar)) // Save objects to mongodb
                .on('finish', async () => {
                    await Poi.insertMany(pois).catch(reject);

                    addedObjects += pois.length;

                    bar.update(0, { addedObjects });
                    await db.close();
                    rimraf.sync(levelDbPath);
                    bar.stop();
                    addUnmatchedTags(); // Add unmatched category tags to category list under "misc"
                    resolve();
                })
                .on('error', (error) => {
                    rimraf.sync(levelDbPath); // Delete temporary database
                    bar.stop();
                    reject(error);
                });
        } catch (error) {
            rimraf.sync(levelDbPath); // Delete temporary database
            bar.stop();
            reject(error);
        }
    });
}

module.exports = {
    parseFile
};
