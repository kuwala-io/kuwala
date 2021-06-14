const mongoose = require('mongoose');

const tmpCellSchema = new mongoose.Schema(
    {
        h3Index: {
            type: String,
            required: true
        },
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
        timestamps: false,
        versionKey: false,
        writeConcern: {
            w: 0
        }
    }
);

const TmpCell = mongoose.model('TmpCell', tmpCellSchema);

module.exports = TmpCell;
