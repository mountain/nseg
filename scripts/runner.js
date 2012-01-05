#!/usr/bin/env node

var pwd  = process.cwd(),
    command = process.argv[2],
    target = process.argv[3];

if (command === 'build') {
    if (target === 'trie') {
        require('./build-trie').run();
    } else if (target === 'freq') {
        require('./build-freq').run();
    }
} else if (command === 'do') {
    console.log(require('../lib/mmseg')(target));
} else if (command === 'find') {
    var dict = require('../lib/dict');
    console.log(dict.find(target));
} else if (command === 'check') {
    var dict = require('../lib/dict');
    console.log(dict.check(target));
}

