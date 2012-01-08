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
    //console.log('bind: ', target, input.path);

    var strmOut = fs.createWriteStream(target, {flags: 'w+', encoding: 'utf-8'});
    strmOut.on('error', function (err) {
        console.log('strmOut.error', counterExec, target, err);
        //strmOut.destroy();
    });
    strmOut.on('close', function () {
        counterExec--;
        //console.log('strmOut.end', counterExec, target);
    });

    segmenter.register(input.path, function (words, bounds) {
        //console.log('segmenter.write', bounds, target);
        if (strmOut.writable) {
            var out = '';
            for (var i = 0; i < bounds; i++) {
                if (words[i]) {
                    out += words[i] + ' ';
                }
            }
            //console.log(out);
            strmOut.write(out, 'utf-8');
        }
    });
    segmenter.on('error', function (err) {
        //console.log('segmenter.error', err);
    });
    segmenter.on('end', function () {
        segmenter.flush();
        //console.log('segmenter.end', counterExec, target);
        if (strmOut.writable) {
            strmOut.end();
        }
    });

    var strmIn = fs.createReadStream(input.path);
    strmIn.on('end', function () {
        counterFile--;
        //console.log('closing: ', input.path);
        segmenter.read(input.path, null);
    });
    strmIn.on('error', function (error) {
        console.log(error);
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

    var segmenter = mmseg.evented(opts);
    execute(segmenter, options.limits || 1);
};

