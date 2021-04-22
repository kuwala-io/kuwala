require('mongoose-geojson-schema');
const mongoose = require('mongoose');

const poiSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true
        },
        osmId: {
            type: Number,
            required: true
        },
        name: {
            type: String
        },
        h3Index: {
            type: String,
            required: true
        },
        buildingFootprint: {
            type: mongoose.Schema.Types.Geometry,
            default: undefined
        },
        schemaVersion: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);

const Poi = mongoose.model('Poi', poiSchema);

module.exports = Poi;
