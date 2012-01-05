/**
 * Originally by John Resig
 * https://github.com/jeresig/trie-js/
 * MIT License
 *
 * Fixed by Mingli Yuan for porpuses of Chinese processing
 */

function optimize(cur) {
    var num = 0, last;

    for (var node in cur) {
        if (typeof cur[node] === "object") {
            var ret = optimize(cur[node]);

            if (ret) {
                delete cur[node];
                cur[node + ret.name] = ret.value;
                node = node + ret.name;
            }
        }

        last = node;
        num++;
    }

    if (num === 1) {
        return {name: last, value: cur[last]};
    }
}

function suffixes(cur, end) {
    var hasObject = false, key = "";

    for (var node in cur) {
        if (typeof cur[node] === "object") {
            hasObject = true;

            var ret = suffixes(cur[node], end);

            if (ret) {
                cur[node] = ret;
            }
        }

        key += "," + node;
    }

    if (!hasObject) {
        if (end[key]) {
            end[key].count++;

        } else {
            end[key] = { obj: cur, count: 1 };
        }

        return key;
    }
}

function finishSuffixes(cur, keepEnd, end) {
    for (var node in cur) {
        var val = cur[node];

        if (typeof val === "object") {
            finishSuffixes(val, keepEnd, end);
        } else if (typeof val === "string") {
            cur[node] = keepEnd[val] || end[val].obj;
        }
    }
}

exports.run = function () {
    var fs = require("fs"),
        txt = fs.readFileSync("data/words.dic", "utf8"),
        words = txt.replace(/\n/g, " ").split(" "),
        trie = {},
        end = {},
        keepEnd = {},
        endings = [ 0 ],
        maxlen = -1;

    // Build a simple Trie structure
    for (var i = 0, l = words.length; i < l; i++)  {
        var word = words[i], letters = word.split(""), cur = trie;
        if (word.length > maxlen) maxlen = word.length;
        var llen = letters.length;
        for (var j = 0; j < llen; j++) {
            var letter = letters[j], pos = cur[letter];

            if (pos == null) {
                cur = cur[letter] = j === letters.length - 1 ? 0 : {};
            } else if (pos === 0) {
                cur = cur[letter] = { $: 0 };
            } else {
                cur = cur[letter];
            }
        }
    }

    // Optimize the structure
    optimize(trie);

    // Figure out common suffixes
    suffixes(trie, end);

    for (var key in end) {
        if (end[key].count > 10) {
            keepEnd[key] = endings.length;
            endings.push(end[key].obj);
        }
    }

    // And extract the suffixes
    finishSuffixes(trie, keepEnd, end);

    trie.$ = endings;

    trie._ = maxlen;

    var ret = 'module.exports = ' + JSON.stringify(trie);

    fs.writeFileSync("data/trie.js", ret, "utf8");
};

