const _ = require('lodash');
const d3 = require('d3-polygon');
const { Formatter } = require('../../../../../../../shared/js');

// Get coordinates of refs
async function convertToGeoJSONCoords(refs, db) {
    // Get node coordinates from level db
    const getCoords = async (ref) => {
        try {
            const node = await db.get(ref);
            const nodeValues = node.split(',');

            return [Number(nodeValues[0]), Number(nodeValues[1])];
        } catch (error) {
            return undefined;
        }
    };

    const closedRefs =
        refs[0] === refs[refs.length - 1] || refs.length < 4
            ? refs
            : [...refs, refs[0]]; // Close polygon if open
    const coords = await Promise.all(closedRefs.map(getCoords));
    const cf = coords.filter((c) => c);

    return (
        cf.length > 1 &&
        ((cf.length > 3 && // Check if polygon has same start and end point
            cf[0][0] === cf[cf.length - 1][0] &&
            cf[0][1] === cf[cf.length - 1][1]) ||
            (cf.length < 4 && // Check if line string has different start and end point
                cf[0][0] !== cf[cf.length - 1][0] &&
                cf[0][1] !== cf[cf.length - 1][1])) &&
        cf
    );
}

function convertMultiPolygon(members) {
    // TODO: Create building footprint for multi polygons
    // Polygon with holes: combine all "outer"; "inner" are holes
    // Polygon with inside parts: "outline" and "parts"
    const coords = [];

    return coords;
}

// Create GeoJSON object based on coordinates
function convertToGeoJSON(coords) {
    return {
        type: coords.length > 3 ? 'Polygon' : 'LineString',
        coordinates: coords.length > 3 ? [coords] : coords
    };
}

// Format lat lng coordinates
function convertLocation(lat, lng) {
    return {
        lat: Formatter.coordToDecimal(lat),
        lng: Formatter.coordToDecimal(lng)
    };
}

// Get the center of a geometry as lat lng pair
function getGeometryCenter(geometry) {
    let centroid;

    if (geometry.type === 'Polygon') {
        centroid = d3.polygonCentroid(geometry.coordinates[0]);
    } else if (geometry.type === 'LineString') {
        centroid = [
            Formatter.coordToDecimal(
                _.mean(geometry.coordinates.map((c) => c[1]))
            ),
            Formatter.coordToDecimal(
                _.mean(geometry.coordinates.map((c) => c[0]))
            )
        ];
    }

    return (
        centroid && {
            lat: Formatter.coordToDecimal(centroid[1]),
            lng: Formatter.coordToDecimal(centroid[0])
        }
    );
}

module.exports = {
    convertToGeoJSONCoords,
    convertMultiPolygon,
    convertToGeoJSON,
    convertLocation,
    getGeometryCenter
};
