const { Cell } = require('../../models');

async function aggregateCells(cells) {
    const result = await Cell.aggregate([
        {
            $match: {
                _id: { $in: cells }
            }
        },
        {
            $group: {
                _id: null,
                total_population: { $sum: '$population.total_population' },
                women: { $sum: '$population.women' },
                men: { $sum: '$population.men' },
                children_under_five: {
                    $sum: '$population.children_under_five'
                },
                youth_15_24: { $sum: '$population.youth_15_24' },
                elderly_60_plus: { $sum: '$population.elderly_60_plus' },
                women_of_reproductive_age_15_49: {
                    $sum: '$population.women_of_reproductive_age_15_49'
                }
            }
        },
        {
            $project: {
                _id: 0,
                population: {
                    total_population: { $round: ['$total_population', 9] },
                    women: { $round: ['$women', 9] },
                    men: { $round: ['$men', 9] },
                    children_under_five: {
                        $round: ['$children_under_five', 9]
                    },
                    youth_15_24: { $round: ['$youth_15_24', 9] },
                    elderly_60_plus: { $round: ['$elderly_60_plus', 9] },
                    women_of_reproductive_age_15_49: {
                        $round: ['$women_of_reproductive_age_15_49', 9]
                    }
                }
            }
        }
    ]);

    return result.length
        ? result[0]
        : {
              population: {
                  total_population: 0,
                  women: 0,
                  men: 0,
                  children_under_five: 0,
                  youth_15_24: 0,
                  elderly_60_plus: 0,
                  women_of_reproductive_age_15_49: 0
              }
          };
}

module.exports = {
    aggregateCells
};
