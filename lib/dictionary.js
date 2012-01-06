/**
 * dictionary.js: the dictionary
 *
 * nmmseg module: Node.js version of MMSEG for Chinese word segmentation
 * https://github.com/mountain/nmmseg/
 * MIT License
 *
 */

module.exports = function (env) {
    var dict = env.config.dict;

    function check(word, cur) {
        return dict[word] === 0;
    }

    function find(word, cur) {
        return dict[word];
    }

    return {
        check: function (word) {
            return check(word);
        },
        inspect: function (word, cur) {
            if (!word && !cur) {
                return dict;
            } else {
                return find(word, cur);
            }
        }
    };
};
