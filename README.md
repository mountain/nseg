Node.js Version of MMSG for Chinese Word Segmentation
======================================================

MMSG originally invented by Chih-Hao Tsai is a very popular Chinese word
segmentation algorithm. Many implementations are available on different
platforms including Python, Java, etc.

This package provide Node.js version of MMSG algorithm.

Build status
============

This project is tested with [Travis CI](http://travis-ci.org)
[![Build Status](https://secure.travis-ci.org/mountain/nmmseg.png)](http://travis-ci.org/mountain/nmmseg)

Install
=======

Use nmmsg in your own package

    $ npm install nmmsg

Or if you want to use `nmmsg` command

    $ npm install -g nmmsg

Command line
============

After intsalling globally, you can use `nmmsg` command to:

help

    $ nmmsg help

segment text using default dictionary

    $ nmmsg seg "石室诗士施氏，嗜食狮，誓食十狮。氏时时适市视狮。"
    $ nmmsg seg -i ~/project/text/shi.txt -o ~/project/output/shi.txt
    $ nmmsg seg -i ~/project/text/a.txt ~/project/text/b.txt -o ~/project/output
    $ nmmsg seg -i ~/project/text -o ~/project/output

build user dictionary for loading aftermath

    $ nmmsg dict ~/project/data/dict.js ~/dict/dict1.txt ~/dict/dict2.txt
    $ nmmsg dict ~/project/data/dict.js ~/dict

build character-frequecy map for loading aftermath

    $ nmmsg freq ~/project/data/freq.js ~/freq/data1.csv ~/freq/data2.csv
    $ nmmsg freq ~/project/data/freq.js ~/freq

segment text using customized settings

    $ nmmsg seg -d ~/project/data/dict.js "石室诗士施氏，嗜食狮，誓食十狮。"
    $ nmmsg seg -d ~/project/data/dict.js -f ~/project/data/freq.js "石室诗士施氏"
    $ nmmsg seg -l ~/project/lex/datetime.js ~/project/lex/sina.js "石室诗士施氏"

inspect the trie structure for a word

    $ nmmsg inspect "石狮"
    $ nmmsg inspect -d ~/project/data/dict.js "石狮"

check the existence of a word

    $ nmmsg check "石狮"
    $ nmmsg check -d ~/project/data/dict.js "石狮"

Using nmmsg in program
======================

Preparation
-----------

- (Optional) build your own dictionay and freqency map
- (Optional) create your own lexical handler for special text pattern

Examples
--------

Use case for normal mode

````javascript
var dict  = require('../data/dict'),
    freq  = require('../data/freq'),
    date  = require('../lex/datetime'),
    sina  = require('../lex/sina');

var opts  = {
        dict: dict,
        freq: freq,
        lex: [date, sina],
        logger: console
    };

var nmmsg = require('nmmsg').normal(opts);

var text = "石室诗士施氏，嗜食狮，誓食十狮。氏时时适市视狮。";

var segmented = nmmsg(text);

````

Use case for evented mode

````javascript
var opts  = {
        dict: dict,
        freq: freq,
        lex: [date, sina],
        logger: console,
        buffer: 30
    };

var nmmsg = require('nmmsg').evented(opts);

nmmsg.start(key);
nmmsg.read(key, fragment);
nmmsg.flush(key);
nmmsg.end(key);

nmmsg.register(key, function(segments) {
    console.log(segments);
});
````

Lexical handler customization
=============================

Lexical handlers support definitions by regexp patterns or acceptor functions.

License
=======

MIT License
