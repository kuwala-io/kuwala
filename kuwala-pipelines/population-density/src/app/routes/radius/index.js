const Router = require('express');
const h3Config = require('../../../../config/h3');
const { H3Utils } = require('../../../../../common/js_utils');
const { Mongo } = require('../../../utils');

const router = Router();

// Route for calculating the population within a given radius in meter
// When an H3 index is provided the cells within the radius are calculated based on its resolution
// Otherwise for lat lng pairs the default resolution is used
router.get('/:radius', async (req, res, next) => {
    try {
        const { radius } = req.params;
        const { h3Index, resolution } = await H3Utils.transformQueryParams(req);
        const cellsInRadius = H3Utils.getCellsInRadius(
            h3Index,
            radius,
            // The population resolution is 11 which only makes resolutions
            // lower or equal than that relevant
            resolution < h3Config.POPULATION_RESOLUTION
                ? resolution
                : h3Config.POPULATION_RESOLUTION
        );
        const cellsRegex = H3Utils.getRegexForCells(
            cellsInRadius,
            resolution,
            h3Config.POPULATION_RESOLUTION
        );
        const populationInRadius = await Mongo.aggregateCells(cellsRegex);

        res.status(200).json({
            status: 200,
            message: `Fetched population for ${h3Index} within an approximate radius of ${radius} m`,
            data: populationInRadius
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
