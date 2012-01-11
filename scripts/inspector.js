/**
 * inspector.js: inspector for the trie structure
 *
 * nseg module: Node.js version of MMSEG for Chinese word segmentation
 *
 * https://github.com/mountain/nseg/
 *
 * By Mingli Yuan <mingli.yuan+nseg@gmail.com> (http://onecorner.org/)
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

exports.check = function (dictpath, word) {
    var lpath = loadpath(__dirname, dictpath) || '../data/dict.js',
        dict  = require(lpath);
    console.log(dict[word] === 1);
};

