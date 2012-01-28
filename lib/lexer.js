/**
 * lexer.js: lex algorithm
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

var buildins = require('./lex');

module.exports = function (config) {
    var customized = config.lexers || [],
        checkers   = customized.concat(buildins),
        ids        = [];

    for (var i = 0, cnts = checkers.length; i < cnts; i++) {
        ids.push(i + 1);
        checkers[i].id = i + 1;
    }

    function map(idArray) {
        var checkerArray = [];
        for (var i = 0, cnts = idArray.length; i < cnts; i++) {
            checkerArray.push(checkers[idArray[i] - 1]);
        }
        return checkerArray;
    }

    return function (state, buf, pos) {

        //console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
        //console.log(pos, buf.substring(0, 15));
        //console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');

        pos = pos || 0;
        state = state || ['', []];
        var tokens = [],
            undecided = state[0] || '',
            accepted  = state[1] || [],
            stepped   = [],
            decided   = false;

        var currents = [];
        for (var i = 0, cnts = accepted.length; i < cnts; i++) {
            currents.push(checkers[accepted[i] - 1]);
        }
        if (currents.length === 0) {
            currents = checkers;
            accepted = ids;
        }

        var length = buf.length,
            len = length > 30 ? 30 : length;
        for (var j = pos; j < len; j++) {
            var ch = buf[j], next;
            if (j + 1 < length) {
                next = buf[j + 1];
            } else {
                next = '';
            }
            for (var k = 0, lmts = currents.length; k < lmts; k++) {
                var cur   = currents[k],
                    level = cur.accept(ch, undecided, next);
                if (k === 0 && level === 1) {
                    stepped = [accepted[k]];
                    decided = true;
                    break;
                } else if (level >= 0) {
                    stepped.push(accepted[k]);
                }
            }

            //console.log("'" + undecided + "'", stepped, tokens);

            var counts = stepped.length;
            if (counts === 1 && decided) {
                tokens.push([stepped[0], ch]);
                undecided = '';
                currents = checkers;
                accepted = ids;
                stepped = [];
                decided = false;
            } else if (counts >= 1) {
                tokens.push([-1, ch]);
                undecided += ch;
                currents = map(stepped);
                accepted = stepped;
                stepped = [];
                decided = false;
            } else {
                tokens.push([0, ch]);
                undecided = '';
                currents = checkers;
                accepted = ids;
                stepped = [];
                decided = false;
            }
        }

        //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        //console.log(undecided, stepped, tokens);
        //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

        return [tokens, [undecided, stepped]];
    };
};

