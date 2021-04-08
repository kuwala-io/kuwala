const countries = require('i18n-iso-countries');
const readlineSync = require('readline-sync');
const shell = require('shelljs');
const fs = require('fs');

async function downloadFiles(selectedCountry) {
    return new Promise((resolve, reject) => {
        console.info(
            `Downloading data for ${countries.getName(selectedCountry, 'en')}`
        );

        if (
            shell.exec(
                `aws s3 ls --no-sign-request s3://dataforgood-fb-data/csv/month=2019-06/country=${selectedCountry}/`,
                { silent: true }
            ).code !== 0
        ) {
            return reject(
                new Error(`No data available for ${selectedCountry}`)
            );
        }

        fs.mkdirSync(`./tmp/countries/${selectedCountry}/population`, {
            recursive: true
        });
        fs.mkdirSync(`./tmp/countries/${selectedCountry}/kepler`);

        if (
            shell.exec(
                `aws s3 sync --no-sign-request --delete s3://dataforgood-fb-data/csv/month=2019-06/country=${selectedCountry} ./tmp/countries/${selectedCountry}/population`
            ).code !== 0
        ) {
            return reject(new Error('Failed to download data'));
        }

        return resolve();
    });
}

async function pick() {
    return new Promise(async (resolve, reject) => {
        try {
            const c = Object.entries(countries.getNames('en'));
            const numberOfPages = Math.ceil(c.length / 35); // 35 is the max length for readlineSync
            const pages = [];

            for (let i = 0; i < numberOfPages; i += 1) {
                pages.push(
                    c
                        .slice(i * 35, i * 35 + 35)
                        .map((entry) => entry.join(' - '))
                );
            }

            let option = -1;
            let currentPage = 0;

            while (currentPage < pages.length && option < 0) {
                option = readlineSync.keyInSelect(
                    pages[currentPage],
                    'Please select a country!',
                    { cancel: 'Next page' }
                );

                if (option < 0) {
                    currentPage += 1;
                }
            }

            if (option > -1) {
                const selectedCountry = countries.alpha2ToAlpha3(
                    pages[currentPage][option].split(' - ')[0]
                );

                if (fs.existsSync(`./tmp/countries/${selectedCountry}`)) {
                    console.info(
                        `Already downloaded data for ${countries.getName(
                            selectedCountry,
                            'en'
                        )}`
                    );

                    return resolve(selectedCountry);
                }

                await downloadFiles(selectedCountry);

                return resolve(selectedCountry);
            }

            return reject(new Error('No country selected'));
        } catch (error) {
            return reject(error);
        }
    });
}

module.exports = {
    pick
};
