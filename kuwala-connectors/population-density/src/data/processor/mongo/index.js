const mongoose = require('mongoose');
const cliProgress = require('cli-progress');
const { TmpCell } = require('../../../models');

async function mapReduceTmpCells() {
    return new Promise(async (resolve, reject) => {
        try {
            const progressBar = new cliProgress.SingleBar(
                {
                    clearOnComplete: false,
                    hideCursor: false,
                    forceRedraw: true,
                    format: 'Aggregating temporary cells… {duration_formatted}',
                    etaBuffer: 10000
                },
                cliProgress.Presets.shades_grey
            );

            progressBar.start(1, 0);

            await TmpCell.aggregate([
                {
                    $group: {
                        _id: '$h3Index',
                        total_population: { $sum: '$total_population' },
                        women: { $sum: '$women' },
                        men: { $sum: '$men' },
                        children_under_five: {
                            $sum: '$children_under_five'
                        },
                        youth_15_24: { $sum: '$youth_15_24' },
                        elderly_60_plus: { $sum: '$elderly_60_plus' },
                        women_of_reproductive_age_15_49: {
                            $sum: '$women_of_reproductive_age_15_49'
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        population: {
                            total_population: '$total_population',
                            women: '$women',
                            men: '$men',
                            children_under_five: '$children_under_five',
                            youth_15_24: '$youth_15_24',
                            elderly_60_plus: '$elderly_60_plus',
                            women_of_reproductive_age_15_49:
                                '$women_of_reproductive_age_15_49'
                        }
                    }
                },
                { $merge: 'cells' }
            ]).allowDiskUse(true);

            progressBar.stop();

            await mongoose.connection.db.dropCollection('tmpcells');

            return resolve();
        } catch (error) {
            return reject(error);
        }
    });
}

module.exports = {
    mapReduceTmpCells
};
