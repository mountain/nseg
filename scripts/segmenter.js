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
    freq  = require('../data/freq'),
    opts  = {
        dict: dict,
        freq: freq,
        logger: console
    };


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
                file.target = path.basename(file.path);
                callback(null, file);
                touched = true;
            }
        })
        .end(function () {
            counterDir--;
            touched = true;
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
                file.target = path.basename(file.path);
                callback(null, file);
                touched = true;
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
                touched = true;
            }
        }
    }
    counterDir--;
    touched = true;
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
                touched = true;
            }
        }
        touched = true;
    }
}

var queue = [];

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
    var strmOut = fs.createWriteStream(target, {flags: 'w+', encoding: 'utf-8'});

    segmenter.register(input.path, function (words) {
        for (var i = 0, len = words.length; i < len; i++) {
            strmOut.write(words[i], 'utf-8');
            strmOut.write(' ', 'utf-8');
        }
    });
    segmenter.on('end', function () {
        segmenter.flush();
        strmOut.end();
        counterFile--;
        counterExec--;
    });

    var strmIn = fs.createReadStream(input.path, {encoding: 'utf-8'});
    strmIn.on('end', function () {
        console.log('closing: ', input.path);
        segmenter.read(input.path, null);
    });
    strmIn.on('error', function (error) {
        throw error;
    });
    strmIn.on('open', function () {
        counterFile++;
        segmenter.start(input.path);
    });
    strmIn.on('data', function (data) {
        segmenter.read(input.path, data);
    });
}

function execute(segmenter, limits) {
    function executor() {
        var pair = dequeue();
        if (pair === null) {
            return;
        }
        counterExec++;
        bind(segmenter, pair[0], pair[1]);
    }
    function throttled() {
        console.log(counterFile, queue.length);
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

    if (options.dictionary) {
        opts.dictionary = require(loadpath(__dirname, options.dictionary));
    }
    if (options.frequency) {
        opts.frequency = require(loadpath(__dirname, options.frequency));
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
                    path.exists(target, function (exists) {
                        if (exists) {
                            throw 'file[' + target + '] exists! conflict should be resolved.';
                        } else {
                            enqueue(target, input);
                        }
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
                });
            }
        })
        .end();

    var segmenter = mmseg.evented(opts);
    execute(segmenter, options.limits || 1);
};

