/**
 * frequency.js: the character-frequency map
 *
 * nseg module: Node.js version of MMSEG for Chinese word segmentation
 *
 * https://github.com/mountain/nseg/
 *
 * By Mingli Yuan <mingli.yuan+nseg@gmail.com> (http://onecorner.org/)
 *
 * MIT License
 *
 */

module.exports = function (map) {
    return function (ch) {
        return map[ch];
    };
};


