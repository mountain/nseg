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

function loadpath(basedir, targetfile) {
}

var mmseg = require('../lib/mmseg'),
    dict  = require('../data/dict'),
    freq  = require('../data/freq'),
    opts  = {
        dict: dict,
        freq: freq,
        logger: console
    };

exports.VERSION = mmseg.VERSION;

exports.seg = function (options, text) {
    if (options.dict) {
        opts.dict = requrie(loadpath(__dirname, options.dict));
    }
    if (options.freq) {
        opts.freq = requrie(loadpath(__dirname, options.freq));
    }

    var segmenter = mmseg.normal(opts);

    var output = function (whatever, text) {
        var array = segmenter.seg(text);
        console.log(array.join(' '));
    };

    function outputDir(dirname) {
    }

    var target = options.output;
    if (target && path.existSync(target)) {
        var stats = fs.statSync(target);
        if (stats.isFile()) {
            output = function (whatever, text) {
                var array = segmenter.seg(text);
            };
        } else if (stats.isDirectory()) {
            output = function (dest, text) {
                var array = segmenter.seg(text);
            };
        }
    }

    if (text) {
        output(null, text);
    }

    if (options.inputs) {
        options.inputs.each(function (input) {
            if (!input) return;
            if (!path.existSync(input)) return;

            var stats = fs.statSync(input);
            if (stats.isFile()) {
                output(path.basename(input), fs.readFileSync(input, 'utf-8'));
            } else if (stats.isDirectory()) {
                outputDir(input);
            }
        });
    }
};

