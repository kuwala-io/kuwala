const { Transform } = require('stream');
const CoordsParser = require('./coordsParser');

// Construct building footprints based on the refs of a way
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

module.exports = {
    buildingFootprintStream
};
