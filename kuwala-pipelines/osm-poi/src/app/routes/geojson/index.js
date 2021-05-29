const Router = require('express');
const { Errors, H3Utils } = require('../../../../../shared/js');
const { h3Config } = require('../../../../config');
const { Poi } = require('../../../models');

const router = Router();

// Route for getting all POIs within a given GeoJSON object
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
                h3Config.POI_RESOLUTION
            );
            const pois = await Poi.find({ h3Index: { $in: cellsRegex } });

            res.status(200).json({
                status: 200,
                message: `Fetched ${pois.length} POIs in given geojson`,
                data: pois
            });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
