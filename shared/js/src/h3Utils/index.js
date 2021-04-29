const h3 = require('h3-node');
const h3js = require('h3-js');
const Decimal = require('decimal.js');
const { MissingQueryParametersError, RadiusError } = require('../errors');
const ArrayUtils = require('../arrayUtils');

const DEFAULT_RESOLUTION = 11;

// Get the H3 index and resolution based on the query parameters
function transformQueryParams(req) {
    const { h3_index, lat, lng } = req.query;
    let h3Index;
    let resolution = DEFAULT_RESOLUTION;

    if (!(h3_index || lat || lng)) {
        return new MissingQueryParametersError(['h3_index', 'lat', 'lng']);
    }

    if (h3_index) {
        h3Index = h3_index;
        resolution = h3.h3GetResolution(h3Index);
    } else if (lat && lng) {
        h3Index = h3.geoToH3(Number(lat), Number(lng), DEFAULT_RESOLUTION);
    } else {
        return new MissingQueryParametersError([lat ? 'lng' : 'lat']);
    }

    return { h3Index, resolution };
}

// Transform cell to specific resolution
function transformCellToResolution(cell, resolution) {
    const cellResolution = h3.h3GetResolution(cell);

    if (cellResolution < resolution) {
        return h3js.h3ToCenterChild(cell, resolution); // Method not in h3-node
    }

    if (cellResolution > resolution) {
        return h3.h3ToParent(cell, resolution);
    }

    return cell;
}

// Get all cells within a given radius of a cell at a specified resolution
function getCellsInRadius(cell, radius, resolution) {
    let centerCell;

    if (!resolution) {
        // Transform passed cell to default resolution
        centerCell = transformCellToResolution(cell, DEFAULT_RESOLUTION);
    } else {
        // Transform passed cell to passed resolution
        centerCell = transformCellToResolution(cell, resolution);
    }

    const edges = h3.getH3UnidirectionalEdgesFromHexagon(centerCell);
    const totalEdgeLength = edges
        .map((edge) => h3js.exactEdgeLength(edge, 'm')) // Method not in h3-node
        .reduce((totalLength, edgeLength) => {
            return new Decimal(totalLength).add(edgeLength);
        });
    const centerCellRadius = totalEdgeLength.div(edges.length);

    if (centerCellRadius.greaterThan(radius)) {
        return new RadiusError();
    }

    const ringSize = new Decimal(radius)
        .div(centerCellRadius)
        .ceil()
        .toNumber();

    return h3.kRing(centerCell, ringSize);
}

// Get all cells within a given geometry at a specified resolution
function getCellsInGeometry(geometry, resolution) {
    const { coordinates, type } = geometry;

    switch (type.toLowerCase()) {
        case 'polygon':
            return h3.polyfill(
                coordinates,
                resolution || DEFAULT_RESOLUTION,
                true
            );
        case 'multipolygon':
            return coordinates.flatMap((c) =>
                h3.polyfill(c, resolution || DEFAULT_RESOLUTION, true)
            );
        default:
            return [];
    }
}

// Get regex strings for an array of cells (assuming all have the same resolution)
// 1. Unnecessary parts at the end of the H3 strings are removed based on the resolution of the cells
// 2. The regex strings are transformed to the resolution that is necessary for the query
//      (The second character of the H3 string indicates its resolution)
function getRegexForCells(cells, cellResolution, regexResolution) {
    // noinspection JSCheckFunctionSignatures
    return ArrayUtils.unique(
        cells.map((cell) =>
            cell.slice(0, (cellResolution || DEFAULT_RESOLUTION) + 1)
        ) // See 1. above
    ).map(
        (cell) =>
            new RegExp(
                `^${cell.substr(0, 1)}${regexResolution.toString(
                    16
                )}${cell.substr(2)}`
            ) // See 2. above
    );
}

module.exports = {
    getCellsInGeometry,
    getCellsInRadius,
    getRegexForCells,
    transformQueryParams
};
