const h3 = require('h3-node');
const { Transform } = require('stream');
const CoordsParser = require('./coordsParser');
const { Poi } = require('../../../models');
const { excludedTags, includedTags } = require('../../../../config');

const tagFilterStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        this.push(
            chunk.filter(
                (item) =>
                    Object.keys(item.tags).find(
                        (tag) => includedTags.indexOf(tag) > -1
                    ) &&
                    !Object.keys(item.tags).find(
                        (tag) => excludedTags.indexOf(tag) > -1
                    )
            )
        );

        callback();
    }
});

function buildingFootprintStream(db) {
    return new Transform({
        objectMode: true,
        async transform(chunk, encoding, callback) {
            const items = [];

            // Looping is faster than Promise.all on large chunks and reverse loop is faster than forward loop
            for (let i = chunk.length - 1; i >= 0; i -= 1) {
                let buildingFootprint;
                const item = chunk[i];

                if (item.type === 'way') {
                    const coords = await CoordsParser.convertToGeoJSONCoords(
                        item.refs,
                        db
                    );

                    if (coords) {
                        buildingFootprint = CoordsParser.convertToGeoJSON(
                            coords
                        );
                    }
                }

                items.push({ ...item, buildingFootprint });
            }

            this.push(items);

            callback();
        }
    });
}

const locationStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        this.push(
            chunk
                .filter(
                    (item) => item.type === 'node' || item.buildingFootprint
                )
                .map((item) => {
                    let location;

                    if (item.type === 'node') {
                        location = CoordsParser.convertLocation(
                            item.lat,
                            item.lon
                        );
                    } else if (item.type === 'way') {
                        location = CoordsParser.getGeometryCenter(
                            item.buildingFootprint
                        );
                    } else {
                        return undefined;
                    }

                    return { ...item, location };
                })
        );

        callback();
    }
});

const h3Stream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        this.push(
            chunk.map((item) => {
                const { lat, lng } = item.location;

                return { ...item, h3Index: h3.geoToH3(lat, lng, 15) };
            })
        );

        callback();
    }
});

const modelStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        this.push(
            chunk.map(
                ({ id, type, name, h3Index, buildingFootprint }) =>
                    new Poi({
                        osmId: id,
                        type,
                        name,
                        h3Index,
                        buildingFootprint
                    })
            )
        );

        callback();
    }
});

module.exports = {
    buildingFootprintStream,
    h3Stream,
    locationStream,
    modelStream,
    tagFilterStream
};
