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

var evented = require('./evented');

var strm  = require('./util/string-stream'),
    dict  = require('../data/dict'),
    freq  = require('../data/freq');

var VERSION = '0.0.7';

exports.normal = function (config) {
    config = config || {};
    config.dict = config.dict || dict;
    config.freq = config.freq || freq;
    config.lexers = config.lexers || [];

    return function (text, callback) {
        var pipe = evented(config);
        var streamIn  = new (strm.StringStreamIn)(text),
            streamOut = new (strm.StringStreamOut)(callback);
        var piping = pipe(streamIn, streamOut);
        piping.on('start', function () {
            streamIn.start();
        });
        piping.start();
        setTimeout(function () {
            piping.end();
        }, 50);
    };
};

exports.evented = function (config) {
    config.dict = config.dict || dict;
    config.freq = config.freq || freq;
    config.lexers = config.lexers || [];

    return evented(config);
};

exports.VERSION = VERSION;


