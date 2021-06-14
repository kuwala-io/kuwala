/* eslint-disable prefer-destructuring */
const fs = require('fs');
const { Transform } = require('stream');
const { categories } = require('../../../../../resources');

// Mapped tags to high level categories
function parseCategoryTags(tags) {
    const categoryKeys = Object.keys(categories);

    return Array.from(
        new Set(
            tags
                .map((tag) => {
                    const matchedCategories = [];

                    categoryKeys.forEach(
                        (c) =>
                            categories[c].tags.indexOf(tag) > -1 &&
                            matchedCategories.push(categories[c].category)
                    );

                    if (!matchedCategories.length) {
                        fs.appendFile(
                            'tmp/unmatchedTags.csv',
                            `${tag}\n`,
                            (error) => error && console.error(error)
                        );

                        return [categories.misc.category];
                    }

                    return matchedCategories;
                })
                .flat()
        )
    );
}

// Create address object based on tags
function parseAddressTag(tag, a) {
    const address = { ...a };
    const key = tag[0].split(':')[1];

    // eslint-disable-next-line default-case
    switch (key) {
        case 'housenumber':
            address.houseNr = tag[1];
            break;
        case 'street':
            address.street = tag[1];
            break;
        case 'postcode':
            address.zipCode = tag[1];
            break;
        case 'city':
            address.city = tag[1];
            break;
        case 'country':
            address.country = tag[1];
            break;
        case 'full':
            address.full = tag[1];
            break;
        case 'neighbourhood': // Area within a suburb or quarter
            address.region.neighborhood = tag[1];
            break;
        case 'suburb': // An area within commuting distance of a city
            address.region.suburb = tag[1];
            break;
        case 'district': // Administrative division
            address.region.district = tag[1];
            break;
        case 'province': // Administrative division
            address.region.province = tag[1];
            break;
        case 'state': // Administrative division
            address.region.state = tag[1];
            break;
        case 'housename': // Sometimes additionally to or instead of house number
            address.houseName = tag[1];
            break;
        case 'place': // Territorial zone (e.g., island, square) instead of street
            address.place = tag[1];
            break;
        case 'block': // In some countries used instead of house number
            address.block = tag[1];
            break;
        case 'floor':
            address.details.level = tag[1];
            break;
        case 'level':
            address.details.level = tag[1];
            break;
        case 'flats':
            address.details.flats = tag[1];
            break;
        case 'unit':
            address.details.unit = tag[1];
            break;
    }

    return address;
}

// Convert OSM tags into relevant properties
const tagStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        this.push(
            chunk.map((item) => {
                const categoryTags = [];
                let name;
                let address = {
                    region: {},
                    details: {}
                };
                let website;
                let email;
                let phone;

                item.tags.forEach((tag) => {
                    if (tag[0].includes('addr:')) {
                        address = parseAddressTag(tag, address);
                    } else {
                        // eslint-disable-next-line default-case
                        switch (tag[0]) {
                            case 'aeroway':
                            case 'amenity':
                            case 'building':
                            case 'craft':
                            case 'historic':
                            case 'leisure':
                            case 'office':
                            case 'public_transport':
                            case 'railway':
                            case 'shop':
                            case 'sport':
                            case 'station':
                            case 'tourism':
                                tag[1].split(/[;,]/).forEach((t) => {
                                    categoryTags.push(`${tag[0]}=${t.trim()}`);
                                });
                                break;
                            case 'name':
                                name = tag[1];
                                break;
                            case 'url':
                            case 'website':
                                website = tag[1];
                                break;
                            case 'email':
                                email = tag[1];
                                break;
                            case 'phone':
                                phone = tag[1];
                                break;
                        }
                    }
                });

                if (!Object.keys(address.region).length) {
                    delete address.region;
                }

                if (!Object.keys(address.details).length) {
                    delete address.details;
                }

                return {
                    ...item,
                    categories: categoryTags.length
                        ? parseCategoryTags(categoryTags)
                        : undefined,
                    name,
                    address: Object.keys(address).length ? address : undefined,
                    website,
                    email,
                    phone
                };
            })
        );

        callback();
    }
});

module.exports = {
    tagStream
};
