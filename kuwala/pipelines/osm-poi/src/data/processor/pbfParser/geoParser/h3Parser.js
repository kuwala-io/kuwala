const h3 = require('h3-node');
const { Transform } = require('stream');

// Convert lat lng pair to H3 string
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

module.exports = {
    h3Stream
};
