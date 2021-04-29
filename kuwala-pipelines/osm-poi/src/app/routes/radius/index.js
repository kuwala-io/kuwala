const Router = require('express');
const { H3Utils } = require('../../../../../../shared/js');
const { Poi } = require('../../../models');

const router = Router();

// Route for getting all POIs within a given radius in meter
// When an H3 index is provided the cells within the radius are calculated based on its resolution
// Otherwise for lat lng pairs the default resolution is used
router.get('/:radius', async (req, res) => {
    try {
        const { radius } = req.params;
        const { h3Index, resolution } = await H3Utils.transformQueryParams(req);
        const cellsInRadius = H3Utils.getCellsInRadius(h3Index, radius);
        const cellsRegex = H3Utils.getRegexForCells(
            cellsInRadius,
            resolution,
            15
        );
        const pois = await Poi.find({ h3Index: { $in: cellsRegex } });

        return res.status(200).json({
            status: 200,
            message: `Fetched ${pois.length} POIs for ${h3Index} within an approximate radius of ${radius} m`,
            data: pois
        });
    } catch (error) {
        console.error(`Request id: ${req.id}\n${error.stack}`);

        return res.status(error.code || 400).json({ error });
    }
});

module.exports = router;
