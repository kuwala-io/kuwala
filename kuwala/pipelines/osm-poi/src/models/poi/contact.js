const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
    {
        website: {
            type: String
        },
        email: {
            type: String
        },
        phone: {
            type: String
        }
    },
    {
        _id: false,
        timestamps: true
    }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
