const { buildingFootprintStream } = require('./buildingFootprintParser');
const { h3Stream } = require('./h3Parser');
const { locationStream } = require('./locationParser');

module.exports = {
    buildingFootprintStream,
    h3Stream,
    locationStream
};
