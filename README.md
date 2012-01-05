Node.js version of MMSEG for Chinese Word Segmentation
======================================================

MMSEG originally invented by Chih-Hao Tsai is a very popular Chinese word
segmentation algorithm. Many implementations are available on different
platforms including Python, Java, etc.

This package provide Node.js version of MMSEG algorithm.

Install
=======

Use mmseg in your own package

    $ npm install mmseg

Or if you want to use `mmseg` command

    $ npm install -g mmseg

Command line
============

After intsalling globally, you can use `mmseg` command to:

help

    $ mmseg help

segment text using default dictionary

    $ mmseg seg "石室诗士施氏，嗜食狮，誓食十狮。氏时时适市视狮。"
    $ mmseg seg -i ~/project/text/shi.txt -o ~/project/output/shi.txt
    $ mmseg seg -i ~/project/text/a.txt ~/project/text/b.txt -O ~/project/output
    $ mmseg seg -I ~/project/text -O ~/project/output

build user dictionary for loading aftermath

    $ mmseg build dict ~/project/data/dict.js ~/dict/dict1.txt ~/dict/dict2.txt
    $ mmseg build dict ~/project/data/dict.js ~/dict

build character-frequecy map for loading aftermath

    $ mmseg build freq ~/project/data/freq.js ~/freq/data1.csv ~/freq/data2.csv
    $ mmseg build freq ~/project/data/freq.js ~/freq

segment text using customized settings

    $ mmseg seg -d ~/project/data/dict.js "石室诗士施氏，嗜食狮，誓食十狮。"
    $ mmseg seg -d ~/project/data/dict.js -f ~/project/data/freq.js "石室诗士施氏"
    $ mmseg seg -l ~/project/lex/datetime.js ~/project/lex/sina.js "石室诗士施氏"

inspect the trie structure for a word

    $ mmseg inspect "石狮"
    $ mmseg inspect -d ~/project/data/dict.js "石狮"

check the existence of a word

    $ mmseg check "石狮"
    $ mmseg check -d ~/project/data/dict.js "石狮"

Using mmseg in program
======================

Preparation
-----------

- (Optional) build your own dictionay and freqency map
- (Optional) create your own lexical handler for special text pattern

Example
-------

````javascript
var dict  = require('../data/dict'),
    freq  = require('../data/freq'),
    date  = require('../lex/datetime'),
    sina  = require('../lex/sina');

var opts  = {
        dict: dict,
        freq: freq,
        lex: [date, sina]
    };

var mmseg = require('mmseg')(opts);

var text = "石室诗士施氏，嗜食狮，誓食十狮。氏时时适市视狮。";

var segmented = mmseg(text);
````

Lexical handler customization
=============================



License
=======

MIT License
