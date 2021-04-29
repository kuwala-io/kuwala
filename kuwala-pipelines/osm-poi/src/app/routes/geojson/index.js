const Router = require('express');
const { Errors, H3Utils } = require('../../../../../../shared/js');
const { Poi } = require('../../../models');

const router = Router();

// Route for getting all POIs within a given GeoJSON object
router.get('/', async (req, res) => {
    try {
        const { geometry } = req.body;

        if (!geometry) {
            const error = new Errors.MissingBodyParametersError(['geometry']);
            console.error(`Request id: ${req.id}\n${error}`);

            return res.status(error.code).json(error);
        }

        const cellsInGeometry = H3Utils.getCellsInGeometry(geometry);
        const cellsRegex = H3Utils.getRegexForCells(
            cellsInGeometry,
            undefined,
            15
        );
        const pois = await Poi.find({ h3Index: { $in: cellsRegex } });

        return res.status(200).json({
            status: 200,
            message: `Fetched ${pois.length} POIs in given geojson`,
            data: pois
        });
    } catch (error) {
        console.error(`Request id: ${req.id}\n${error.stack}`);

        return res.status(error.code || 400).json({ error });
    }
});

module.exports = router;
