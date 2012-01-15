/**
 * mmseg.js: interface for application developer
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

var VERSION = '0.0.0';

module.exports = function (config) {
    return require('./evented')(config);
};

module.exports.VERSION = VERSION;


