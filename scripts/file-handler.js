/**
 * file-handler.js: handle files
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
        .readdir(dir.path)
        .stat()
        .each(function (file) {
            if (file.stat.isDirectory()) {
                var basepath = dir.basepath;
                file.basepath = basepath;
                file.target = path.relative(basepath, dir.path);
                handleDirAsync(file, callback);
            } else {
                //console.log('path: ', file.path);
                file.target = path.relative(dir.basepath, file.path);
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
                handleDirAsync(file, callback);
            } else {
                //console.log('path: ', file.path);
                file.target = path.basename(file.path);
                callback(null, file);
            }
        })
        .end();
}

function selectInputsSync(inputs, callback) {
    if (typeof inputs === 'string') {
        inputs = [inputs];
    }
    var input = inputs[0];
    if (path.existsSync(input)) {
        var stat = fs.statSync(input);
        if (stat.isDirectory()) {
            throw 'input[' + input + '] is a directory! It should be a file.';
        } else {
            var file = {
                path: input,
                target: path.basename(input)
            };
            callback(null, file);
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
    //console.log('bind: ', target, input);
    var strmOut = fs.createWriteStream(target, {flags: 'w+', encoding: 'utf-8'});
    strmOut.on('close', function () {
        counterExec--;
    });

    var strmIn = fs.createReadStream(input);
    strmIn.on('end', function () {
        counterFile--;
    });
    strmIn.on('open', function () {
        counterFile++;
        touched = true;
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

/**
 * Offers functionality similar to mkdir -p
 * Orinally at https://gist.github.com/742162
 * Modified for our own purpose
 *
 * Asynchronous operation. No arguments other than a possible exception
 * are given to the completion callback.
 */
function mkdir_p(filepath, mode, callback, position) {
    mode = mode || 0777;
    position = position || 0;
    var parts = require('path').normalize(filepath).split('/');
    parts = parts.slice(0, parts.length - 1);

    if (position >= parts.length) {
        if (callback) {
            return callback();
        } else {
            return true;
        }
    }

    var directory = parts.slice(0, position + 1).join('/');
    if (directory) {
        fs.stat(directory, function (err) {
            if (err === null) {
                mkdir_p(filepath, mode, callback, position + 1);
            } else {
                fs.mkdir(directory, mode, function (error) {
                    mkdir_p(filepath, mode, callback, position + 1);
                });
            }
        });
    }
}

function safeEnqueue(target, input) {
    mkdir_p(target, null, function (err) {
            if (err) {
                console.log('err:', target);
                throw err;
            }
            enqueue(target, input);
        }
    );
}

exports.VERSION = mmseg.VERSION;

exports.segf = function (options) {

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
            if (file.exists) {
                touched = true;
                throw 'file[' + file.path + '] exists! conflict should be resolved first.';
            }
            return !file.exists;
        })
        .each(function (output) {
            selectInputsSync(options.inputs, function (err, input) {
                if (err) {
                    throw err;
                }
                safeEnqueue(output.path, input.path);
            });
        })
        .end();

    var segmenter = mmseg({
        dict: dictionary || dict,
        freq: frequency || freq
    });
    execute(segmenter, options.limits || 1);
};

exports.segd = function (options) {

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
                    var target = path.resolve(output.path, input.target);
                    target = path.relative(process.cwd(), target);
                    //console.log('input.target: ', input.target);
                    //console.log('target: ', target);
                    //console.log('cwd: ', process.cwd());

                    path.exists(target, function (exists) {
                        if (exists) {
                            throw 'file[' + target + '] exists! conflict should be resolved first.';
                        } else {
                            //console.log('enqueue: ', target, input);
                            safeEnqueue(target, input.path);
                        }
                        touched = true;
                    });
                });
            } else {
                throw 'target[' + output.path + '] is a file! please use segf command.';
            }
        })
        .end();

    var segmenter = mmseg.evented({
        dict: dictionary || dict,
        freq: frequency || freq
    });
    execute(segmenter, options.limits || 1);
};

