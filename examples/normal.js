var dict   = require('../data/dict'),
    freq   = require('../data/freq'),
    at     = require('./sina-at'),
    smily  = require('./sina-smily'),
    tag    = require('./sina-tag');

var opts  = {
        dict: dict,
        freq: freq,
        lexers: [at, smily, tag]
    };

var nseg = require('../index').normal(opts);

//nseg('刚刚更换了@Weico微博客户端 的#PinkPink#主题！推荐你们也试试看，hello @一二三四五 @六七八九十 ', function (result) {
//    console.log(result);
//});

nseg('在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。', function (result) {
    console.log(result);
});

