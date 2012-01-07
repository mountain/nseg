/**
 * evented.js: maintain structrues for evented programming
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

module.exports = function (env) {
    var emitter = new (require('events').EventEmitter)(),
        lex     = require('./lexer')(env),
        match   = require('./matcher')(env),
        filter  = require('./filter')(env);

    var registry  = {},
        buffers   = {},
        positions = {};

    function trim(key) {
        return function () {
            var buf = buffers[key],
                pos = positions[key];

            buffers[key] = buf.substring(pos);
            positions[key] = 0;
        };
    }

    var closing = {};
    function tryClose(key) {
        closing[key] = 1;
    }

    function handle(key) {
        function progress() {
            var result = [];
            if (buffers[key]) {
                var segs = filter(match(buffers[key], lex(buffers[key], positions[key])));
                positions[key] = segs[1];
                result = result.concat(segs[2]);
                if (result.length > 0) {
                    emitter.emit('write', key, result);
                    result = [];
                }

                process.nextTick(progress);
            } else {
                if(!closing[key]) {
                    process.nextTick(progress);
                }
            }
        }
        progress();
    }

    function flush(key) {
        var buf = buffers[key],
            pos = positions[key] || 0;

        if (!buf) {
            return;
        }

        var len = buf.length,
            result = [];

        while (pos < len) {
            var segs = filter(match(buf, lex(buf, pos)));
            pos = segs[1];
            result = result.concat(segs[2]);
        }

        buffers[key] = '';
        positions[key] = 0;

        emitter.emit('write', key, result);
    }

    emitter.on('start', function (key) {
        buffers[key] = '';
        positions[key] = 0;

        handle(key);
    });

    emitter.on('read', function (key, fragment) {
        if (fragment !== null) {
            buffers[key] = buffers[key] + fragment;

            if (buffers[key].length > 1024) {
                process.nextTick(trim(key));
            }
        } else {
            tryClose(key);
            console.log('closing', key);
        }
    });

    emitter.on('flush', function (key) {
        flush(key);
    });

    emitter.on('end', function (key) {
        flush(key);

        delete registry[key];
        delete positions[key];
    });

    return {
        register: function (key, callback) {
            registry[key] = callback;
            emitter.on('write', function (src, words) {
                registry[src](words);
            });
        },
        start: function (key) {
            emitter.emit('start', key);
        },
        read: function (key, fragment) {
            emitter.emit('read', key, fragment);
        },
        flush: function (key) {
            emitter.emit('flush', key);
        },
        end: function (key) {
            emitter.emit('end', key);
        },
        on: function (event, listener) {
            emitter.on(event, listener);
        }
    };
};

