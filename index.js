/**
 * index.js: entrance point for the module
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

var mmseg = require('./lib/mmseg');

module.exports = function (opts) {
    return mmseg(opts);
};

module.exports.VERSION = mmseg.VERSION;
