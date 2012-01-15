/**
 * chinese-numerals.js: for Chinese numerals
 *
 * NSEG module: Node.js version of NSEG for Chinese word segmentation
 *
 * https://github.com/mountain/nseg/
 *
 * By Mingli Yuan <mingli.yuan+nseg@gmail.com> (http://onecorner.org/)
 *
 * MIT License
 *
 */

var pattern = /([一二三四五六七八九零〇]+[十百千万亿兆]*)+/;

exports.accept = function (ch, undecided) {
    return pattern.test(undecided + ch);
};

