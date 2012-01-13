/**
 * index.js: entrance point for the build-in lexers
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

var an  = require('./arabic-numerals'),
    cn  = require('./chinese-numerals'),
    ltn = require('./latin'),
    dtm = require('./datetime'),
    dt  = require('./date'),
    tm  = require('./time'),
    cyr = require('./cyrillic'),
    grk  = require('./greek');

module.exports = [
    ltn,
    cyr,
    grk,
    dt,
    tm,
    dtm,
    an,
    cn
];



