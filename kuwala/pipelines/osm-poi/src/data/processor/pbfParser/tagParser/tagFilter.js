const { Transform } = require('stream');
const { excludedTags, includedTags } = require('../../../../../config');

// Filter items for parsing based on their tags
const tagFilterStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        this.push(
            chunk
                .map((item) => ({ ...item, tags: Object.entries(item.tags) }))
                .filter(
                    (item) =>
                        item.tags.find(
                            (tag) => includedTags.indexOf(tag[0]) > -1
                        ) &&
                        !item.tags.find(
                            (tag) => excludedTags.indexOf(tag[0]) > -1
                        )
                )
        );

        callback();
    }
});

module.exports = {
    tagFilterStream
};
