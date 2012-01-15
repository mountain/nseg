var vows   = require('vows'),
    assert = require('assert'),
    events  = require('events'),
    nseg   = require('../index').normal();

// Create a Test Suite
vows.describe('Segment by default settings').addBatch({
    '下午研究生源计划': {
        topic: function () {
            var promise = new (events.EventEmitter)();
            nseg('下午研究生源计划', function (text) {
                promise.emit('success', text);
            });
            return promise;
        },

        'we get result': function (result) {
            assert.equal(result, '下午 研究 生源 计划');
        }
    }
}).export(module);

