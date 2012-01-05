/**
 * filter.js: filtering algorithm
 *
 * nmmseg module: Node.js version of MMSEG for Chinese word segmentation
 * https://github.com/mountain/nmmseg/
 * MIT License
 *
 * Originally by John Resig
 * https://github.com/jeresig/trie-js/
 * MIT License
 *
 * Fixed by Mingli Yuan for porpuses of Chinese processing
 *
 */

var freq = require('../data/freq'),
    dict = require('../data/dict');

function checkDict(word, cur) {
    // Get the root to start from
    cur = cur || dict;

    // Go through every leaf
    for (var node in cur) {
        // If the start of the word matches the leaf
        if (word.indexOf(node) === 0) {
            // If it's a number
            var val = typeof cur[node] === "number" && cur[node] ?
            // Substitute in the removed suffix object
            dict.$[cur[node]] :
            // Otherwise use the current value
            cur[node];

            // If this leaf finishes the word
            if (node.length === word.length) {
                // Return 'true' only if we've reached a final leaf
                return val === 0 || val.$ === 0;

            // Otherwise continue traversing deeper
            // down the tree until we find a match
            } else {
                return checkDict(word.slice(node.length), val);
            }
        }
    }

    return false;
}

function findDict(word, cur) {
    if (cur === 0) return -1;

    // Get the root to start from
    cur = cur || dict;

    // Go through every leaf
    for (var node in cur) {
        // If the start of the word matches the leaf
        if (word.indexOf(node) === 0) {
            // If it's a number
            var val = typeof cur[node] === "number" && cur[node] ?
            // Substitute in the removed suffix object
            dict.$[cur[node]] :
            // Otherwise use the current value
            cur[node];

            // If this leaf finishes the word
            if (node.length === word.length) {
                // Return 'true' only if we've reached a final leaf
                return val;

            // Otherwise continue traversing deeper
            // down the tree until we find a match
            } else {
                return findDict(word.slice(node.length), val);
            }
        }
    }

    return -1;
}

exports.freq = function (ch) {
    return freq[ch] || 0;
};

exports.check = function (word) {
    return checkDict(word);
};

exports.find = function (word, cur) {
    if (!word && !cur) {
        return dict;
    } else {
        return findDict(word, cur);
    }
};

