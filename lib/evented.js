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
        results   = [],
        bufpositions  = {},
        rsltpositions = {},
        trimcount = {},
        readed    = {},
        closing   = {},
        counter   = 0;

    function resultadd(key, array) {
        var pos  = rsltpositions[key],
            rslt = results[key];
        for (var i = 0, len = array.length; i < len; i++) {
            var old = rslt[pos + i];
            rslt[pos + i] = array[i];
            delete old;
        }
        pos = pos + len;
        rsltpositions[key] = pos;
        delete array;
    }

    function trim(key) {
        return function () {
            var buf = buffers[key],
                pos = bufpositions[key];

            if (buf && pos) {
                buffers[key] = buf.substring(pos);
                bufpositions[key] = 0;
                //console.log('trim:', key, bufpositions[key]);
                process.nextTick(handle(key));
            }
        };
    }

    function tryClose(key) {
        return function () {
            if (typeof bufpositions[key] === 'undefined') {
                return;
            }
            //console.log('try close:', key, bufpositions[key]);
            if (readed[key] && buffers[key] === '') {
                if (counter > 0) {
                    //console.log('closing:', key, bufpositions[key]);
                    emitter.emit('end', key);
                    counter--;
                }
            }
        };
    }

    function handle(key) {
        return function () {
            var result = results[key];
            if (buffers[key] && bufpositions[key] >= 0) {
                var segs = filter(match(buffers[key], lex(buffers[key], bufpositions[key])));

                bufpositions[key] = segs[1];
                resultadd(key, segs[2]);

                var bounds = rsltpositions[key];
                if (rsltpositions[key] > 256) {
                    emitter.emit('write:' + key, results[key], bounds);
                    rsltpositions[key] = 0;
                }
                //console.log('step:', key, bufpositions[key]);

                var count = trimcount[key];
                if (count === 0) {
                    process.nextTick(trim(key));
                }
                count = (count + 1) % 7;
                trimcount[key] = count;

                process.nextTick(handle(key));
            } else {
                if (!closing[key]) {
                    process.nextTick(handle(key));
                } else {
                    process.nextTick(tryClose(key));
                }
            }
        };
    }

    function flush(key) {
        var buf = buffers[key],
            pos = bufpositions[key] || 0,
            bounds = rsltpositions[key];

        if (!buf && !bounds) {
            return;
        }

        var len = buf.length;

        while (pos < len) {
            var segs = filter(match(buf, lex(buf, pos)));
            pos = segs[1];
            resultadd(key, segs[2]);
        }

        buffers[key] = '';
        bufpositions[key] = 0;

        bounds = rsltpositions[key];
        //console.log('flush:', key, bounds);
        if (bounds > 0) {
            emitter.emit('write:' + key, results[key], bounds);
            rsltpositions[key] = 0;
        }
    }

    emitter.on('start', function (key) {
        counter++;
        buffers[key] = '';
        bufpositions[key] = 0;
        rsltpositions[key] = 0;
        trimcount[key] = 0;

        var holder = [];
        for (var i = 0; i < 300; i++) {
            holder.push(null);
        }
        results[key] = holder;

        process.nextTick(handle(key));
    });

    emitter.on('read', function (key, fragment) {
        if (fragment !== null) {
            buffers[key] = buffers[key] + fragment;
            readed[key] = true;

            if (buffers[key].length > 1024) {
                process.nextTick(handle(key));
            }
        } else {
            closing[key] = true;
            process.nextTick(tryClose(key));
        }
    });

    emitter.on('flush', function (key) {
        flush(key);
    });

    emitter.on('end', function (key) {
        flush(key);

        delete registry[key];
        delete buffers[key];
        delete bufpositions[key];
        delete results[key];
        delete rsltpositions[key];
    });

    emitter.setMaxListeners(60);

    return {
        register: function (key, callback) {
            registry[key] = callback;
            emitter.on('write:' + key, function (words, bounds) {
                registry[key](words, bounds);
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
            emitter.removeListener('write:' + key);
        },
        on: function (event, listener) {
            emitter.on(event, listener);
        }
    };
};

