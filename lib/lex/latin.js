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

 var pattern = /[`~!@#$%^&*()-_+={}[]|\:;"'?,.<>—]/;

exports.accept = function (ch, undecided) {
    return 'a' <= ch && ch <= 'z' ||
           'A' <= ch && ch <= 'Z' ||
           'Ā' <= ch && ch <= 'ɏ' || pattern.test(ch);
};

