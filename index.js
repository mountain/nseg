/**
 * index.js: entrance point for the module
 *
 * NSEG module: Node.js version of NSEG for Chinese word segmentation
 *
 * https://github.com/mountain/nseg/
 *
 * By Mingli Yuan <mingli.yuan+nseg@gmail.com> (http://onecorner.org/)
 *
 * MIT License
 *
 */

var mmseg = require('./lib/mmseg');

module.exports = function (opts) {
    return mmseg(opts);
};

module.exports.VERSION = mmseg.VERSION;
