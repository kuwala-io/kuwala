const readlineSync = require('readline-sync');

function pickItem(items, query) {
    try {
        const pageLength = 35; // 35 is the max length for readlineSync
        const numberOfPages = Math.ceil(items.length / pageLength);
        const pages = [];

        for (let i = 0; i < numberOfPages; i += 1) {
            pages.push(items.slice(i * pageLength, (i + 1) * pageLength));
        }

        let option = -1;
        let currentPage = 0;

        while (currentPage < pages.length && option < 0) {
            option = readlineSync.keyInSelect(pages[currentPage], query, {
                cancel: pages.length - currentPage > 1 ? 'Next page' : 'Cancel'
            });

            if (option < 0) {
                currentPage += 1;
            }
        }

        if (option > -1) {
            return option + currentPage * pageLength;
        }

        if (option === -1) {
            return undefined;
        }

        console.error('Wrong input');

        return undefined;
    } catch (error) {
        console.error(error);

        return undefined;
    }
}

module.exports = {
    pickItem
};
