/**
 * evented.js: maintain structrues for evented programming
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

function MMSegStream(config, streamIn) {
    this.buffer = '';
    this.pos = 0;
    this.readable = false;
    this.streamIn = streamIn;

    var self = this, count = 0;

    self.streamIn.on('data', function (data) {
        if (!self.readable) {
            self.readable = true;
        }
        self.buffer += data;
    });
    self.streamIn.on('error', function (error) {
        self.readable = false;
        self.emit('error', error);
    });

    var lex     = config.lex,
        match   = config.match,
        filter  = config.filter;

    function tryClose() {
        if (self.streamIn.readable) {
            process.nextTick(handle);
            return;
        }
        var buf = self.buffer;
        //console.log('try close', self.buffer);
        if (!(self.streamIn.readable) && buf === '') {
            self.emit('end');
        }
    }
    function trim() {
        var buf = self.buffer,
            pos  = self.pos;

        if (buf && pos) {
            self.buffer = buf.substring(pos);
            self.pos = 0;
            //console.log('trim', self.buffer);
            process.nextTick(handle);
        }
    }
    function handle() {
        //console.log('handle', self.buffer);
        var buf = self.buffer,
            pos = self.pos,
            state = self.state;

        if (buf && pos >= 0) {
            var lexed = lex(state, buf, pos);
            var segs = filter(match(lexed[0]));

            //console.log('data', self.buffer);
            self.pos += segs[2];
            self.state = lexed[1];
            self.emit('data', segs[3]);

            if (count === 0) {
                process.nextTick(trim);
            }
            count = (count + 1) % 7;

            process.nextTick(handle);
        } else {
            if (self.streamIn.readable) {
                process.nextTick(handle);
            } else {
                process.nextTick(tryClose);
            }
        }
    }

    handle();
}

util.inherits(MMSegStream, Stream);

MMSegStream.prototype.destroy = function () {
    this.readable = false;
    this.emit('end');
};

function MMSegPipe(config, streamIn, streamOut) {
    this.config = config;
    this.streamIn = streamIn;
    this.streamOut = streamOut;
    this.config.bufSize = config.bufSize || 256;
    this.list = require('./util/reusable-list')(this.config.bufSize * 1.25);
}

util.inherits(MMSegPipe, EventEmitter);

MMSegPipe.prototype.start = function () {
    var self = this;
    this.streamSeg = new MMSegStream(this.config, this.streamIn);
    this.streamSeg.on('data', function (data) {
        //console.log('data', data);
        //self.streamOut.write(data.join(self.config.delima || ' '));
        var list = self.list, config = self.config;
        list.concat(data);
        if (list.length >= config.bufSize) {
            self.streamOut.write(list.join(config.delima || ' '));
            list.clear();
        }
    });
    this.streamSeg.on('end', function () {
        //console.log('end');
        if (self.streamOut.writable) {
            self.streamOut.end(self.list.join(self.config.delima || ' '), 'utf-8');
        }
        self.emit('end', self);
    });
    this.streamSeg.on('error', function (error) {
        self.emit('error', error);
    });
    this.emit('start', this);
};

MMSegPipe.prototype.end = function () {
    this.emit('end', this);
    this.streamIn.destroy();
    this.streamSeg.destroy();
};

MMSegPipe.prototype.flush = function () {
    this.streamOut.write(this.list.join(this.config.delima || ' '));
};

module.exports = function (config) {
    config = config || {};

    config.lex     = require('./lexer')(config);
    config.match   = require('./matcher')(config);
    config.filter  = require('./filter')(config);

    return function (streamIn, streamOut) {
        return new MMSegPipe(config, streamIn, streamOut);
    };

};

