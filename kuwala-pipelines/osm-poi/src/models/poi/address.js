const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
    {
        houseNr: {
            type: String
        },
        houseName: {
            type: String
        },
        block: {
            type: String
        },
        street: {
            type: String
        },
        place: {
            type: String
        },
        zipCode: {
            type: String
        },
        city: {
            type: String
        },
        country: {
            type: String
        },
        full: {
            type: String
        },
        region: {
            type: new mongoose.Schema(
                {
                    neighborhood: {
                        type: String
                    },
                    suburb: {
                        type: String
                    },
                    district: {
                        type: String
                    },
                    province: {
                        type: String
                    },
                    state: {
                        type: String
                    }
                },
                {
                    _id: false
                }
            ),
            default: undefined
        },
        details: {
            type: new mongoose.Schema(
                {
                    level: {
                        type: String
                    },
                    flats: {
                        type: String
                    },
                    unit: {
                        type: String
                    }
                },
                {
                    _id: false
                }
            ),
            default: undefined
        }
    },
    {
        _id: false,
        timestamps: true
    }
);

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
