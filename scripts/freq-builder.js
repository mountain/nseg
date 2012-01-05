/**
 * freq-builder.js: build character frequency map
 *
 * MMSEG module: Node.js version of MMSEG for Chinese word segmentation
 *
 * https://github.com/mountain/mmseg/
 *
 * By Mingli Yuan <mingli.yuan+mmseg@gmail.com> (http://onecorner.org/)
 *
 * MIT License
 *
 */

exports.run = function () {
    var fs = require("fs"),
        txt = fs.readFileSync("data/freq.dic", "utf8"),
        pairs = txt.replace(/\n/g, " ").split(" "),
        freq = {};

    for (var i = 0; i < pairs.length;) {
        var ch = pairs[i + 1];
        if (ch) {
            freq[ch] = parseInt(pairs[i], 10);
        }
        i = i + 2;
    }

    var ret = 'module.exports = ' + JSON.stringify(freq);

    fs.writeFileSync("data/freq.js", ret, "utf8");
};
