const Router = require('express');
const h3 = require('h3-node');
const h3Config = require('../../../../config/h3');
const { H3Utils } = require('../../../../../shared/js');
const { Mongo } = require('../../../utils');

const router = Router();

// Get population aggregated for a single H3 cell
router.get('/', async (req, res, next) => {
    try {
        const { h3Index, resolution } = await H3Utils.transformQueryParams(req);
        let matchingCells = [h3Index];

        if (resolution > h3Config.POPULATION_RESOLUTION) {
            matchingCells = [
                h3.h3ToParent(h3Index, h3Config.POPULATION_RESOLUTION)
            ];
        } else if (resolution < h3Config.POPULATION_RESOLUTION) {
            matchingCells = h3.h3ToChildren(
                h3Index,
                h3Config.POPULATION_RESOLUTION
            );
        }

        const cellsRegex = H3Utils.getRegexForCells(
            matchingCells,
            resolution,
            h3Config.POPULATION_RESOLUTION
        );
        const population = await Mongo.aggregateCells(cellsRegex);

        res.status(200).json({
            status: 200,
            message: `Fetched population for ${h3Index}`,
            data: population
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
