/**
 * latin.js: for latin characters
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

function test(ch) {
    return 'a' <= ch && ch <= 'z' ||
           'A' <= ch && ch <= 'Z' ||
           'Ā' <= ch && ch <= 'ɏ' ||
           '-' === ch;
}

exports.accept = function (ch, undecided, next) {
    if (test(ch)) {
        if (!test(next)) {
            return 1;
        } else {
            return 0;
        }
    } else {
        return -1;
    }
};

