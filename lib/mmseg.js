/**
 * mmseg.js: interface for application developer
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

var VERSION = '0.0.0';

function normal(env) {

    var lex    = require('./lexer')(env),
        match  = require('./matcher')(env),
        filter = require('./filter')(env);

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
    var env = {
        config: config
    };

    return normal(env); // a function
};

exports.evented = function (config) {
    var env = {
        config: config
    };

    return require('./evented')(env); // an object
};

