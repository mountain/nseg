/**
 * segmenter.js: do segmentation for input text
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

var path = require('path'),
    fs   = require('fs');

function loadpath(from, to) {
    if (!to) return '';
    var lpath = path.relative(from, to);
    lpath = lpath.substring(0, lpath.length);
    return lpath;
}

var async = require('asyncjs'),
    mmseg = require('../lib/mmseg'),
    dict  = require('../data/dict'),
    freq  = require('../data/freq'),
    opts  = {
        dict: dict,
        freq: freq,
        logger: console
    };

function handleDirAsync(path, callback) {
    async
        .readdir(path)
        .stat()
        .each(function (file) {
            if (file.stat.isDirectory()) {
                handleDirAsync(file.path, callback);
            } else {
                callback(null, file);
            }
        })
        .end();
}

function selectInputsAsync(inputs, callback) {
    if (typeof inputs === 'string') {
        inputs = [inputs];
    }
    async
        .files(inputs)
        .exists()
        .filter(function (file) {
            return file.exists;
        })
        .stat()
        .each(function (file) {
            if (file.stat.isDirectory()) {
                handleDirAsync(file.path, callback);
            } else {
                callback(null, file);
            }
        })
        .end();
}

function handleDirSync(path, callback) {
    async
        .readdir(path)
        .stat()
        .each(function (file) {
            if (file.stat.isDirectory()) {
                handleDirSync(file.path, callback);
            } else {
                callback(null, file.path);
            }
        })
        .end();
}

function selectInputsSync(inputs, callback) {
    if (typeof inputs === 'string') {
        inputs = [inputs];
    }
    async
        .files(inputs)
        .exists()
        .filter(function (file) {
            return file.exists;
        })
        .stat()
        .each(function (file) {
            if (file.stat.isDirectory()) {
                handleDirSync(file.path);
            } else {
                callback(null, file.path);
            }
        })
        .end();
}

function bind(segmenter, output, input) {
    segmenter.register(input.path, function (words) {
        //TODO
        console.log(words);
    });

    var strmIn = fs.createReadStream(input.path, {encoding: 'utf-8'});
    strmIn.on('error', function (error) {
        throw error;
    });
    strmIn.on('open', function () {
        segmenter.start(input.path);
    });
    strmIn.on('data', function (data) {
        segmenter.read(input.path, data);
    });
    strmIn.on('end', function () {
        segmenter.end(input.path);
    });
}

exports.VERSION = mmseg.VERSION;

exports.seg = function (options, text) {

    if (options.dictionary) {
        opts.dictionary = require(loadpath(__dirname, options.dictionary));
    }
    if (options.frequency) {
        opts.frequency = require(loadpath(__dirname, options.frequency));
    }

    var segmenter = mmseg.evented(opts);

    async
        .files([options.output])
        .exists()
        .filter(function (file) {
            return file.exists;
        })
        .stat()
        .each(function (output) {
            if (output.stat.isDirectory()) {
                selectInputsAsync(options.inputs, function (err, input) {
                    bind(segmenter, output, input);
                });
            } else {
                selectInputsSync(options.inputs, function (err, input) {
                    bind(segmenter, output, input);
                });
            }
        })
        .end();
};

