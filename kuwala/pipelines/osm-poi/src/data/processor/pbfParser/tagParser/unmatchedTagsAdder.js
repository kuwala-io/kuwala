const fs = require('fs');
const prettyJson = require('json-stringify-pretty-compact');
const { categories } = require('../../../../../resources');

// Store category tags that couldn't be matched under "misc"
// Sort all category tags (necessary when new have been added)
function addUnmatchedTags() {
    const path = 'tmp/unmatchedTags.csv';

    if (!fs.existsSync(path)) {
        return;
    }

    const unmatchedTags = Array.from(
        new Set(fs.readFileSync(path).toString().split('\n'))
    ).filter((tag) => tag.length && tag !== 'yes');
    const updatedCategories = { ...categories };
    updatedCategories.misc.tags = [
        ...updatedCategories.misc.tags,
        ...unmatchedTags
    ];
    const categoryKeys = Object.keys(updatedCategories);

    categoryKeys.forEach((key) => {
        updatedCategories[key].tags.sort();
    });
    fs.writeFileSync(
        'resources/categories.json',
        prettyJson(updatedCategories)
    );
    fs.unlinkSync(path);
}

module.exports = {
    addUnmatchedTags
};
