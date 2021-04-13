const OSMDownloader = require('./osmDownloader');

async function start() {
    try {
        await OSMDownloader.downloadFile();
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    start
};
