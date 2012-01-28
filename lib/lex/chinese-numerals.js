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

var pattern = /^([一二两三四五六七八九零〇]+[十百千万亿兆]*)+$/;

function test(string) {
    return pattern.test(string);
}

exports.accept = function (ch, undecided, next) {
    if (test(ch) || test(undecided)) {
        if (!test(undecided + ch + next)) {
            return 1;
        } else {
            return 0;
        }
    } else {
        return -1;
    }
};

