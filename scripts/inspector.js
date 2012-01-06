/**
 * inspector.js: inspector for the trie structure
 *
 * nmmseg module: Node.js version of MMSEG for Chinese word segmentation
 *
 * https://github.com/mountain/nmmseg/
 *
 * By Mingli Yuan <mingli.yuan+nmmseg@gmail.com> (http://onecorner.org/)
 *
 * MIT License
 *
 */

var path = require('path');

function loadpath(from, to) {
    if (!to) return '';
    var lpath = path.relative(from, to);
    lpath = lpath.substring(0, lpath.length - 3);
    return lpath;
}

exports.inspect = function (dictpath, word) {
    var lpath = loadpath(__dirname, dictpath) || '../data/dict.js',
        dict  = require(lpath);
    console.log(require('../lib/dictionary')(dict).inspect(word));
};

exports.check = function (dictpath, word) {
    var lpath = loadpath(__dirname, dictpath) || '../data/dict.js',
        dict  = require(lpath);
    console.log(require('../lib/dictionary')(dict).check(word));
};

