const OSMDownloader = require('./osmDownloader');
const PBFParser = require('./pbfParser');

async function start() {
    try {
        const file = await OSMDownloader.getFile();
        await PBFParser.parseFile(file);
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    start
};
