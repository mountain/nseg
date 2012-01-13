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

var util = require('util'),
    Stream = require('stream').Stream,
    EventEmitter = require('events').EventEmitter;

function TokenStream(config, streamIn) {
    this.buffer = '';
    this.pos = 0;
    this.readable = false;
    this.lexer =

    var self = this, count = 0;

    streamIn.on('data', function (data) {
        if (!self.readable) {
            self.readable = true;
        }
        self.buffer += data;
    });
    streamIn.on('error', function (error) {
        self.readable = false;
        self.emit('error', error);
    });

    var lex = config.lex;

    function tryClose() {
        if (!self.readable) {
            process.nextTick(handle);
            return;
        }
        var buf = self.buffer;
        //console.log('try close');
        if (!(streamIn.readable) && buf === '') {
            self.emit('end');
        }
    }
    function trim() {
        var buf = self.buffer,
            pos  = self.pos;

        if (buf && pos) {
            self.buffer = buf.substring(pos);
            self.pos = 0;
            //console.log('trim');
            process.nextTick(handle);
        }
    }
    function handle() {
        //console.log('handle');
        var buf = self.buffer,
            pos = self.pos,
            tokenChunk;

        if (buf && pos >= 0) {
            tokenChunk = self.lexer.lex(buf, pos);
        }

        if (tokenChunk && tokenChunk[0] > self.pos) {
            //console.log('data');
            self.pos = tokenChunk[0];
            self.emit('data', tokenChunk[1]);

            if (count === 0) {
                process.nextTick(trim);
            }
            count = (count + 1) % 7;

            process.nextTick(handle);
        } else {
            if (streamIn.readable) {
                process.nextTick(handle);
            } else {
                process.nextTick(tryClose);
            }
        }
    }

    handle();
}

util.inherits(TokenStream, Stream);

var buildins = require('./lex');

module.exports = function (config) {
    return function (buf, pos) {
        pos = pos || 0;
        var lexed = [[-1, 0, pos, []]];

        return lexed;
    };
};

