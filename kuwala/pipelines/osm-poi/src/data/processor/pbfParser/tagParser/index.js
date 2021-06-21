const { tagFilterStream } = require('./tagFilter');
const { tagStream } = require('./tagParser');
const { addUnmatchedTags } = require('./unmatchedTagsAdder');

module.exports = {
    addUnmatchedTags,
    tagFilterStream,
    tagStream
};
