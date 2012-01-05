var match = require('./match'),
    filter = require('./filter');

module.exports = function (sentence) {
    var pos = 0,
        len = sentence.length,
        result = [];

    while (pos < len) {
        var segs = filter(match(sentence, pos));
        pos = segs[1];
        result = result.concat(segs[2]);
    }

    return result;
};
