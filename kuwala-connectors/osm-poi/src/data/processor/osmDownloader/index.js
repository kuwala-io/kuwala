const axios = require('axios');
const cliProgress = require('cli-progress');
const fs = require('fs');
const fse = require('fs-extra');
const jsdom = require('jsdom');
const progress = require('progress-stream');
const streamLength = require('stream-length');
const $ = require('jquery')(new jsdom.JSDOM().window);
const { continents } = require('../../../../resources');
const { ItemPicker } = require('../../../../../../shared/utils/js');

const baseUrl = 'https://download.geofabrik.de';
const fileSuffix = '-latest.osm.pbf';

async function pickRegion(url) {
    const regionResponse = await axios.get(url);
    const regionsDoc = $(regionResponse.data);
    // TODO filter special regions because they have no subpage
    const regions = Object.values($(`a[href$='${fileSuffix}']`, regionsDoc))
        .filter((elem) => elem.href)
        .map((elem) => elem.href.split(fileSuffix)[0]);
    const regionIndex = ItemPicker.pickItem(
        ['Download all', ...regions],
        'Which region are you interested in?'
    );

    if (regionIndex < 0) {
        return undefined;
    }

    if (regionIndex === 0) {
        return { url: `${url}${fileSuffix}`, all: true };
    }

    return {
        url: `${url}/${regions[regionIndex - 1]}`,
        all: false
    };
}

async function pickFile() {
    const continentIndex = ItemPicker.pickItem(
        continents,
        'Which continent are you interested in?'
    );

    if (continentIndex > -1) {
        const country = await pickRegion(
            `${baseUrl}/${continents[continentIndex]}`
        );

        if (country) {
            if (country.all) {
                return country.url;
            }

            const region = await pickRegion(country.url);

            if (region) {
                return region.all ? region.url : `${region.url}${fileSuffix}`;
            }
        }
    }

    return undefined;
}

async function downloadFile() {
    const downloadUrl = await pickFile();

    if (!downloadUrl) {
        throw new Error('No file selected');
    }

    const filePath = `tmp${downloadUrl.split(baseUrl)[1]}`;

    await fse.ensureDir(filePath.split(filePath.split('/').pop())[0]);

    const writer = fs.createWriteStream(filePath);
    const bar = new cliProgress.SingleBar(
        {},
        cliProgress.Presets.shades_classic
    );
    const str = progress({
        time: 1000
    });

    str.on('progress', (p) => {
        bar.update(p.transferred);
    });

    const response = await axios.get(downloadUrl, {
        method: 'GET',
        responseType: 'stream'
    });
    // noinspection JSVoidFunctionReturnValueUsed
    const sl = await streamLength(response.data);

    bar.start(sl, 0);

    response.data.pipe(str).pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

module.exports = {
    downloadFile
};
