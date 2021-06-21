const { Transform } = require('stream');
const CoordsParser = require('./coordsParser');

// Convert the location of items
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

module.exports = {
    locationStream
};
