const Router = require('express');
const h3 = require('h3-node');
const h3Config = require('../../../../config/h3');
const { RadiusError } = require('../../errors');
const { Mongo } = require('../../../utils');
const { H3 } = require('../shared');

const router = Router();

router.get('/:radius', async (req, res) => {
    try {
        const { radius } = req.params;
        const { h3Index, resolution } = await H3.transformQueryParams(req);
        let centerCell = h3Index;

        // Transform passed cell to default resolution
        if (resolution < h3Config.DEFAULT_RESOLUTION) {
            centerCell = h3.h3ToCenterChild(
                h3Index,
                h3Config.DEFAULT_RESOLUTION
            );
        } else if (resolution > h3Config.DEFAULT_RESOLUTION) {
            centerCell = h3.h3ToParent(h3Index, h3Config.DEFAULT_RESOLUTION);
        }

        const edges = h3.getH3UnidirectionalEdgesFromHexagon(centerCell);
        const totalEdgeLength = edges
            .map((edge) => h3.exactEdgeLength(edge, 'm'))
            .reduce((totalLength, edgeLength) => {
                return totalLength + edgeLength;
            });
        const centerCellRadius = totalEdgeLength / edges.length;

        if (radius < centerCellRadius) {
            const error = new RadiusError();
            console.error(`Request id: ${req.id}\n${error}`);

            return res.status(error.code).json(error);
        }

        const ringSize = Math.ceil(radius / centerCellRadius);
        const cellsInRadius = h3.kRing(h3Index, ringSize);
        const populationsInRadius = await Mongo.aggregateCells(cellsInRadius);

        return res.status(200).json({
            status: 200,
            message: `Fetched population for ${h3Index} within an approximate radius of ${radius} m`,
            data: populationsInRadius
        });
    } catch (error) {
        console.error(`Request id: ${req.id}\n${error.stack}`);

        return res.status(error.code || 400).json({ error });
    }
});

module.exports = router;
