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

function normal(config) {

    var lex    = require('./lexer')(config),
        match  = require('./matcher')(config),
        filter = require('./filter')(config);

    return function (sentence) {
        var pos = 0,
            len = sentence.length,
            result = [];

        while (pos < len) {
            var segs = filter(match(lex(sentence, pos)));
            pos = segs[1];
            result = result.concat(segs[2]);
        }

        return result;
    };
}

exports.VERSION = VERSION;

exports.normal = function (config) {
    return normal(config); // a function
};

exports.evented = function (config) {
    return require('./evented')(config);
};

