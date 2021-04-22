const Router = require('express');
const h3 = require('h3-node');
const h3Config = require('../../../../config/h3');
const { Mongo } = require('../../../utils');
const { H3 } = require('../shared');

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { h3Index, resolution } = await H3.transformQueryParams(req);
        let matchingCells = [h3Index];

        if (resolution > h3Config.DEFAULT_RESOLUTION) {
            matchingCells = [
                h3.h3ToParent(h3Index, h3Config.DEFAULT_RESOLUTION)
            ];
        } else if (resolution < h3Config.DEFAULT_RESOLUTION) {
            matchingCells = h3.h3ToChildren(
                h3Index,
                h3Config.DEFAULT_RESOLUTION
            );
        }

        const population = await Mongo.aggregateCells(matchingCells);

        return res.status(200).json({
            status: 200,
            message: `Fetched population for ${h3Index}`,
            data: population
        });
    } catch (error) {
        console.error(`Request id: ${req.id}\n${error.stack}`);

        return res.status(error.code || 400).json({ error });
    }
});

module.exports = router;
