const mongoose = require('mongoose');

const populationSchema = new mongoose.Schema(
    {
        total_population: {
            type: Number,
            min: 0
        },
        women: {
            type: Number,
            min: 0
        },
        men: {
            type: Number,
            min: 0
        },
        children_under_five: {
            type: Number,
            min: 0
        },
        youth_15_24: {
            type: Number,
            min: 0
        },
        elderly_60_plus: {
            type: Number,
            min: 0
        },
        women_of_reproductive_age_15_49: {
            type: Number,
            min: 0
        }
    },
    {
        _id: false,
        timestamps: false
    }
);

const Population = mongoose.model('Population', populationSchema);

module.exports = Population;
