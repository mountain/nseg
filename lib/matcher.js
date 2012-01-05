/**
 * matcher.js: matching algorithm
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

var dict = require('./dict'),
    trie = dict.find();

function step(sentence) {

    return function (matched) {

        var results = [], result, i, j, index, temp;

        for (i = 0; i < matched.length; i++) {
            var strct = matched[i],
                cnt   = strct[0],
                pos   = strct[1],
                chunk = strct[2];

            //console.log('========================================');
            //console.log(i, cnt, pos, chunk);
            //console.log('========================================');

            var len      = sentence.length,
                start    = pos,
                end      = pos + trie._,
                prefix   = '',
                previous = chunk;

            temp   = [];
            result = [];
            end = end > len  ? len : end;
            if (start === end) {
                result = [
                    [chunk.length, pos, chunk]
                ];
            }
            for (j = start; j < end; j++) {
                var ch = sentence[j];
                prefix += ch;
                var next = dict.find(prefix);

                if (typeof next === 'object' && next.$ === 0 || next === 0) {
                    temp = chunk.concat([prefix]);
                    result.push([cnt + 1, j + 1, temp]);
                    previous = temp;
                    //console.log('************************************');
                    //console.log(prefix, true, cnt + 1, j + 1, temp);
                    //console.log('************************************');
                } else {
                    temp = previous.concat([ch]);
                    result.push([cnt + 1, j + 1, temp]);
                    previous = temp;
                    //console.log('************************************');
                    //console.log(prefix, false, cnt + 1, j + 1, temp);
                    //console.log('************************************');
                }
            }

            //trim result
            for (j = 0; j < result.length; j++) {
                chunk = result[j][2];
                if (chunk.length > cnt) {
                    result[j][2] = chunk.slice(0, cnt + 1);
                    index = chunk[cnt].length - 1;

                    //console.log('++++++++++++++++++++++++++++++++++++++++');
                    //console.log(cnt, index, chunk, result[index][0], result[index][1], result[index][2]);
                    //console.log('++++++++++++++++++++++++++++++++++++++++');

                    result[j][1] = result[index][1];
                }
            }

            //compact result
            //console.log('----------------------------------------');
            var compact = [], prevInd = -1;
            for (j = 0; j < result.length; j++) {
                index = result[j][1];
                if (prevInd !== index) {
                    compact.push(result[j]);
                    //console.log(result[j][0], result[j][1], result[j][2]);
                }
                prevInd = index;
            }
            //console.log('----------------------------------------');

            results = results.concat(compact);
        }

        return results;
    };

}

module.exports = function (sentence, base) {
    var fn = step(sentence);
    return fn(fn(fn([[0, base, []]])));
};

