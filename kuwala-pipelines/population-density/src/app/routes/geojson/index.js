const Router = require('express');
const { Errors, H3Utils } = require('../../../../../shared/js');
const { h3Config } = require('../../../../config');
const { Mongo } = require('../../../utils');

const router = Router();

// Route for calculating the population within a given GeoJSON object
router.get('/', async (req, res, next) => {
    try {
        const { geometry } = req.body;

        if (!geometry) {
            next(new Errors.MissingBodyParametersError(['geometry']));
        } else {
            const cellsInGeometry = H3Utils.getCellsInGeometry(geometry);
            const cellsRegex = H3Utils.getRegexForCells(
                cellsInGeometry,
                undefined,
                h3Config.POPULATION_RESOLUTION
            );
            const population = await Mongo.aggregateCells(cellsRegex);

            res.status(200).json({
                status: 200,
                message: 'Fetched population in given polygon',
                data: population
            });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
