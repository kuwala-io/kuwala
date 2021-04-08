const mongoose = require('mongoose');
const Population = require('../population');

const cellSchema = new mongoose.Schema(
    {
        _id: String,
        population: {
            type: Population.schema,
            required: true
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

const Cell = mongoose.model('cell', cellSchema);

module.exports = Cell;
