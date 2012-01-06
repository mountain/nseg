/**
 * frequency.js: the character-frequency map
 *
 * nmmseg module: Node.js version of MMSEG for Chinese word segmentation
 *
 * https://github.com/mountain/nmmseg/
 *
 * By Mingli Yuan <mingli.yuan+nmmseg@gmail.com> (http://onecorner.org/)
 *
 * MIT License
 *
 */

module.exports = function (map) {
    return function (ch) {
        return map[ch];
    };
};


