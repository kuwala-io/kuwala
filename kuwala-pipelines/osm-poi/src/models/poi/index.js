require('mongoose-geojson-schema');
const mongoose = require('mongoose');
const Address = require('./address');
const Contact = require('./contact');

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
        osmTags: {
            type: [[String, String]],
            required: true
        },
        name: {
            type: String
        },
        categories: {
            type: [String],
            default: undefined
        },
        h3Index: {
            type: String,
            index: true,
            required: true
        },
        address: {
            type: Address.schema
        },
        contact: {
            type: Contact.schema
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
