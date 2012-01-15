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

    var checkers = buildins, ids = [];
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
            stepped   = [];

        var currents = [];
        for (var i = 0, cnts = accepted.length; i < cnts; i++) {
            currents.push(checkers[accepted[i] - 1]);
        }
        if (currents.length === 0) {
            currents = checkers;
            accepted = ids;
        }

        var len = buf.length > 30 ? 30 : buf.length;
        for (var j = pos; j < len; j++) {
            var ch = buf[j];
            for (var k = 0, lmts = currents.length; k < lmts; k++) {
                var cur = currents[k];
                if (cur.accept(ch, undecided)) {
                    stepped.push(accepted[k]);
                }
            }

            var counts = stepped.length;
            if (counts > 1) {
                tokens.push([-1, ch]);
                undecided += ch;
                //currents = map(stepped);
                //accepted = stepped;
                currents = checkers;
                accepted = ids;
                stepped = [];
            } else if (counts === 1) {
                tokens.push([stepped[0], ch]);
                undecided = '';
                currents = checkers;
                accepted = ids;
                stepped = [];
            } else {
                tokens.push([0, ch]);
                undecided = '';
                currents = checkers;
                accepted = ids;
                stepped = [];
            }
        }

        //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        //console.log(undecided, stepped, tokens.slice(0, 5));
        //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

        return [tokens, [undecided, stepped]];
    };
};

