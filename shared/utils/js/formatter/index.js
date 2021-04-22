const { Decimal } = require('decimal.js');

function coordToDecimal(number) {
    return new Decimal(number).toDecimalPlaces(7).toNumber();
}

module.exports = {
    coordToDecimal
};
