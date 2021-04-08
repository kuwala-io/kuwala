const Router = require('express');
const h3 = require('h3-js');
const h3Config = require('../../../../config/h3');
const { MissingBodyParametersError } = require('../../errors');
const { Mongo } = require('../../../utils');

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { geometry } = req.body;

        if (!geometry) {
            const error = new MissingBodyParametersError(['geometry']);
            console.error(`Request id: ${req.id}\n${error}`);

            return res.status(error.code).json(error);
        }

        const { coordinates, type } = geometry;

        const matchingCells =
            type === 'Polygon'
                ? h3.polyfill(coordinates, h3Config.DEFAULT_RESOLUTION, true)
                : coordinates.flatMap((c) =>
                      h3.polyfill(c, h3Config.DEFAULT_RESOLUTION, true)
                  );
        const population = await Mongo.aggregateCells(matchingCells);

        return res.status(200).json({
            status: 200,
            message: 'Fetched population in given polygon',
            data: population
        });
    } catch (error) {
        console.error(`Request id: ${req.id}\n${error.stack}`);

        return res.status(error.code || 400).json({ error });
    }
});

module.exports = router;
