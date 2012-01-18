/**
 * string-stream.js: string input stream
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
    Stream = require('stream').Stream;

function StringStreamIn(text) {
    this.text = text;
    this.readable = true;
}

util.inherits(StringStreamIn, Stream);

StringStreamIn.prototype.start = function () {
    this.emit('data', this.text);
};

StringStreamIn.prototype.destroy = function () {
    this.readable = false;
    this.emit('end');
};

function StringStreamOut(callback) {
    this.callback = callback;
    this.writable = true;
    this.text = '';
}

util.inherits(StringStreamOut, Stream);

StringStreamOut.prototype.write = function (string) {
    this.text = this.text + string;
};

StringStreamOut.prototype.end = function (remain) {
    if (remain) {
        this.text = this.text + remain;
    }
    var callback = this.callback;
    if (callback) {
        callback(this.text);
    }
    this.writable = false;
};

StringStreamOut.prototype.destroy = function () {
    this.end();
};

exports.StringStreamIn = StringStreamIn;
exports.StringStreamOut = StringStreamOut;

