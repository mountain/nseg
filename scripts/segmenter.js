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

var util = require('util'),
    path = require('path'),
    fs   = require('fs');

function loadpath(from, to) {
    if (!to) {
        return '';
    }
    var lpath = path.relative(from, to);
    lpath = lpath.substring(0, lpath.length);
    return lpath;
}

var async = require('asyncjs'),
    mmseg = require('../lib/mmseg'),
    dict  = require('../data/dict'),
    freq  = require('../data/freq');


var touched = false, counterDir = 0;

function handleDirAsync(dir, callback) {
    counterDir++;
    async
        .readdir(dir)
        .stat()
        .each(function (file) {
            if (file.stat.isDirectory()) {
                var basepath = dir.basepath;
                file.basepath = basepath;
                file.target = path.relative(basepath, dir);
                handleDirAsync(file.path, callback);
            } else {
                //console.log('path: ', file.path);
                file.target = path.basename(file.path);
                callback(null, file);
            }
        })
        .end(function () {
            counterDir--;
        });
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
                file.basepath = file.path;
                handleDirAsync(file.path, callback);
            } else {
                //console.log('path: ', file.path);
                file.target = path.basename(file.path);
                callback(null, file);
            }
        })
        .end();
}

function handleDirSync(dir, basepath, callback) {
    counterDir++;
    var inputs = fs.readdirSync(dir);
    for (var i = 0, len = inputs.length; i < len; i++) {
        var input = inputs[i];
        var target = path.relative(basepath, dir);
        if (path.existsSync(input)) {
            var stat = fs.statSync(input);
            if (stat.isDirectory()) {
                handleDirSync(input, basepath, callback);
            } else {
                var file = {
                    path: input,
                    target: target
                };
                callback(null, file);
            }
        }
    }
    counterDir--;
}

function selectInputsSync(inputs, callback) {
    if (typeof inputs === 'string') {
        inputs = [inputs];
    }
    for (var i = 0, len = inputs.length; i < len; i++) {
        var input = inputs[i];
        if (path.existsSync(input)) {
            var stat = fs.statSync(input);
            if (stat.isDirectory()) {
                handleDirSync(input, input, callback);
            } else {
                var file = {
                    path: input,
                    target: path.basename(input)
                };
                callback(null, file);
            }
        }
    }
}

var queue    = [],
    strmOuts = {};

function enqueue(target, input) {
    queue.push([target, input]);
}

function dequeue() {
    if (queue.length > 0) {
        return queue.shift();
    } else {
        return null;
    }
}

var counterExec = 0,
    counterFile = 0;

function bind(segmenter, target, input) {
    //console.log('bind: ', target, input.path);
    var strmOut = fs.createWriteStream(target, {flags: 'w+', encoding: 'utf-8'});
    strmOut.on('close', function () {
        counterExec--;
    });

    var strmIn = fs.createReadStream(input.path);
    strmIn.on('end', function () {
        counterFile--;
    });
    strmIn.on('open', function () {
        counterFile++;
    });

    var pipe = segmenter(strmIn, strmOut);
    pipe.on('error', function (err) {
        console.log('segmenter.error', err);
    });
    pipe.start();
}

function execute(segmenter, limits) {
    function executor() {
        var pair = dequeue();
        //console.log(pair);
        if (pair === null) {
            return;
        }
        counterExec++;
        bind(segmenter, pair[0], pair[1]);
    }
    function throttled() {
        //console.log(touched, counterFile, counterExec, queue.length);
        if (touched && queue.length === 0 && counterDir === 0 && counterFile === 0) {
            return;
        }
        if (counterExec < limits) {
            executor();
        }
        process.nextTick(throttled);
    }
    throttled();
}

exports.VERSION = mmseg.VERSION;

exports.seg = function (options, text) {

    var dictionary, frequency;
    if (options.dictionary) {
        dictionary = require(loadpath(__dirname, options.dictionary));
    }
    if (options.frequency) {
        frequency = require(loadpath(__dirname, options.frequency));
    }

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
                    if (err) {
                        throw err;
                    }
                    var target = path.resolve(output, input.target);
                    //console.log('target: ', target);
                    path.exists(target, function (exists) {
                        if (exists) {
                            throw 'file[' + target + '] exists! conflict should be resolved.';
                        } else {
                            //console.log('enqueue: ', target, input);
                            enqueue(target, input);
                        }
                        touched = true;
                    });
                });
            } else {
                selectInputsSync(options.inputs, function (err, input) {
                    if (err) {
                        throw err;
                    }
                    var target = path.resolve(output, input.target);
                    if (path.existsSync(target)) {
                        throw 'file[' + target + '] exists! conflict should be resolved.';
                    }
                    enqueue(target, input);
                    touched = true;
                });
            }
        })
        .end();

    var segmenter = mmseg.evented({
        dict: dictionary || dict,
        freq: frequency || freq
    });
    execute(segmenter, options.limits || 1);
};

