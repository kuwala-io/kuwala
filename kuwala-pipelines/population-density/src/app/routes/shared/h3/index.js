const h3 = require('h3-node');
const h3Config = require('../../../../../config/h3');
const { MissingQueryParametersError } = require('../../../errors');

async function transformQueryParams(req) {
    return new Promise((resolve, reject) => {
        const { h3_index, lat, lng } = req.query;
        let h3Index;
        let resolution = h3Config.DEFAULT_RESOLUTION;

        if (!(h3_index || lat || lng)) {
            return reject(
                new MissingQueryParametersError(['h3_index', 'lat', 'lng'])
            );
        }

        if (h3_index) {
            h3Index = h3_index;
            resolution = h3.h3GetResolution(h3Index);
        } else if (lat && lng) {
            h3Index = h3.geoToH3(lat, lng, h3Config.DEFAULT_RESOLUTION);
        } else {
            return reject(
                new MissingQueryParametersError([lat ? 'lng' : 'lat'])
            );
        }

        return resolve({ h3Index, resolution });
    });
}

module.exports = {
    transformQueryParams
};
