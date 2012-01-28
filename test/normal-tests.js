var vows   = require('vows'),
    assert = require('assert'),
    events  = require('events'),
    nseg;

// Create a Test Suite
vows.describe('Segment by default settings').addBatch({
    '下午研究生源计划': {
        topic: function () {
            nseg = require('../index').normal();
            var promise = new (events.EventEmitter)();
            nseg('下午研究生源计划', function (text) {
                promise.emit('success', text);
            });
            return promise;
        },
        '下午 研究 生源 计划': function (result) {
            assert.equal(result, '下午 研究 生源 计划');
        }
    },
    '中华民国和中华人民共和国': {
        topic: function () {
            nseg = require('../index').normal();
            var promise = new (events.EventEmitter)();
            nseg('中华民国和中华人民共和国', function (text) {
                promise.emit('success', text);
            });
            return promise;
        },
        '中华民国 和 中华人民共和国': function (result) {
            assert.equal(result, '中华民国 和 中华人民共和国');
        }
    },
    'To be or not to be': {
        topic: function () {
            nseg = require('../index').normal();
            var promise = new (events.EventEmitter)();
            nseg('To be or not to be', function (text) {
                promise.emit('success', text);
            });
            return promise;
        },
        'To   be   or   not   to   be': function (result) {
            assert.equal(result, 'To   be   or   not   to   be');
        }
    },
    '在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。': {
        topic: function () {
            nseg = require('../index').normal();
            var promise = new (events.EventEmitter)();
            nseg('在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。', function (text) {
                promise.emit('success', text);
            });
            return promise;
        },
        '在 我 的 后园 ， 可以 看见 墙外 有 两株 树 ， 一株 是 枣树 ， 还有 一株 也 是 枣树 。': function (result) {
            assert.equal(result, '在 我 的 后园 ， 可以 看见 墙外 有 两株 树 ， 一株 是 枣树 ， 还有 一株 也是 枣树 。');
        }
    }
}).export(module);

