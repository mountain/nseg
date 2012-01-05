/**
 * mmseg.js: interface for application developer
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

var VERSION = '0.0.0';

var lexer   = require('./lexer'),
    match   = require('./matcher'),
    filter  = require('./filter'),
    evented = require('./evented');

function normal(env) {

    var lex   = lexer(env),
        match = matcher(env),
        filte = filter(env);

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

module.exports = function (config) {
    var env = {
        config: config
    };

    if (config.evented) {
        return evented(env); // an object
    } else {
        return normal(env); // a function
    }
};

module.exports.VERSION = VERSION;
