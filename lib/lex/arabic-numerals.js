/**
 * arabic-numerals.js: for Arabic numerals
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

var pattern = /\d+|\d+st|\d+nd|\d+rd/;

function test(string) {
    return pattern.test(string);
}

exports.accept = function (ch, undecided, next) {
    var part = '';
    part += undecided + ch;
    if (test(part)) {
        part += next;
        if (!test(part)) {
            return 1;
        } else {
            return 0;
        }
    } else {
        return -1;
    }
};

