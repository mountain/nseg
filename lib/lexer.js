/**
 * lexer.js: lex algorithm
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

var buildins = require('./lex');

module.exports = function (config) {
    return function (buf, pos) {
        pos = pos || 0;
        var lexed = [];

        for (var i = pos, len = buf.length; i < len; i++) {
            var ch = buf[i];
            lexed.push([0, ch]);
        }

        return lexed;
    };
};

