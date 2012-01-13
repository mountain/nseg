/**
 * matcher.js: matching algorithm
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

function Matcher(dict) {
    this.dict = dict;
}

Matcher.prototype.match = function (tokens, matched) {
    var results = [], result, i, j, index, temp;

    for (i = 0; i < matched.length; i++) {
        var strct = matched[i],
            knd   = strct[0], // kind is alias of type
            cnt   = strct[1],
            pos   = strct[2],
            chunk = strct[3];

        //console.log('========================================');
        //console.log(i, knd, cnt, pos, chunk);
        //console.log('========================================');

        var len      = tokens.length,
            start    = pos,
            end      = pos + this.dict._,
            prefix   = '',
            previous = chunk,
            type     = -1;

        temp   = [];
        result = [];
        end = end > len  ? len : end;
        if (start === end) {
            result = [
                [type, chunk.length, pos, chunk]
            ];
        }
        for (j = start; j < end; j++) {
            var token = tokens[j];

            var ch = token.character;
            if (token.type === 0) {//Chinese
                prefix += ch;
                if (this.dict[prefix]) {
                    temp = chunk.concat([prefix]);
                    result.push([0, cnt + 1, j + 1, temp]);
                    previous = temp;
                    //console.log('************************************');
                    //console.log(prefix, true, cnt + 1, j + 1, temp);
                    //console.log('************************************');
                } else {
                    temp = previous.concat([ch]);
                    result.push([0, cnt + 1, j + 1, temp]);
                    previous = temp;
                    //console.log('************************************');
                    //console.log(prefix, false, cnt + 1, j + 1, temp);
                    //console.log('************************************');
                }
            } else {//Other cases
                if (token.type === type) {
                    prefix += ch;
                } else {
                    if (type === -1) {//Cases uncertain
                        prefix += ch;
                    } else {
                        result.push([type, cnt + 1, j + 1, [prefix]]);
                        prefix = ch;
                    }
                    type = token.type;
                }
            }

        }

        //trim result
        for (j = 0; j < result.length; j++) {
            chunk = result[j][3];
            if (chunk.length > cnt) {
                result[j][3] = chunk.slice(0, cnt + 1);
                index = chunk[cnt].length - 1;

                //console.log('++++++++++++++++++++++++++++++++++++++++');
                //console.log(cnt, index, chunk, result[index][0], result[index][1], result[index][2], result[index][3]);
                //console.log('++++++++++++++++++++++++++++++++++++++++');

                result[j][2] = result[index][2];
            }
        }

        //compact result
        //console.log('----------------------------------------');
        var compact = [], prevInd = -1;
        for (j = 0; j < result.length; j++) {
            index = result[j][2];
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

module.exports = function (config) {
    var dict = config.dict,
        matcher = new Matcher(dict);

    return function (tokens, base) {
        base = base || 0;
        var matched = [[-1, 0, base, []]];

        matched = matcher.match(tokens, matched);
        matched = matcher.match(tokens, matched);
        matched = matcher.match(tokens, matched);

        return matched;
    };
};

