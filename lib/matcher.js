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
            knd   = strct[0] || 0, // kind is alias of type
            cnt   = strct[1] || 0,
            pos   = strct[2] || 0,
            chunk = strct[3] || [];

        //console.log('========================================');
        //console.log(i, knd, cnt, pos, chunk, tokens);
        //console.log('========================================');

        var len      = tokens.length,
            start    = pos,
            end      = pos + this.dict._,
            prefix   = '',
            previous = chunk,
            type     = knd;

        temp   = [];
        result = [];
        end = end > len  ? len : end;
        if (start === end) {
            result = [
                [type, chunk.length, pos, chunk]
            ];
        }

        var curtype;
        for (j = start; j < end; j++) {

            var token = tokens[j];

            if (!token) {
                continue;
            }

            var ch = token[1];
            curtype = token[0];

            //console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
            //console.log(curtype, ch);
            //console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

            if (curtype === 0) { //Chinese
                if (type !== 0 && prefix) {
                    temp = chunk.concat([prefix]);
                    result.push([type, cnt + 1, j, temp]);
                    previous = temp;
                    //console.log('************************************');
                    //console.log(type, curtype, prefix, 'Others2', type, cnt + 1, j, temp);
                    //console.log('************************************');
                    prefix = '';
                    break;
                }
                prefix += ch;
                if (this.dict[prefix]) {
                    temp = chunk.concat([prefix]);
                    result.push([0, cnt + 1, j + 1, temp]);
                    previous = temp;
                    //console.log('************************************');
                    //console.log(type, curtype, prefix, 'Word2', type, cnt + 1, j + 1, temp);
                    //console.log('************************************');
                } else {
                    temp = previous.concat([ch]);
                    result.push([0, cnt + 1, j + 1, temp]);
                    previous = temp;
                    //console.log('************************************');
                    //console.log(type, curtype, prefix, 'Char2', type, cnt + 1, j + 1, temp);
                    //console.log('************************************');
                }
            } else { //Other cases
                if (type === 0 && prefix) {
                    if (this.dict[prefix]) {
                        temp = chunk.concat([prefix]);
                        result.push([0, cnt + 1, j, temp]);
                        previous = temp;
                        //console.log('************************************');
                        //console.log(type, curtype, prefix, 'Word', type, cnt + 1, j, temp);
                        //console.log('************************************');
                    } else {
                        temp = previous.concat([ch]);
                        result.push([0, cnt + 1, j, temp]);
                        previous = temp;
                        //console.log('************************************');
                        //console.log(type, curtype, prefix, 'Char', type, cnt + 1, j, temp);
                        //console.log('************************************');
                    }
                    break;
                } else if (type >= 0 && curtype !== type && prefix) {
                    temp = previous.concat([prefix]);
                    result.push([curtype, cnt + 1, j, temp]);
                    previous = temp;
                    //console.log('************************************');
                    //console.log(type, curtype, prefix, 'Others', type, cnt + 1, j, temp);
                    //console.log('************************************');
                    prefix = '';
                    break;
                }
                prefix += ch;
                end = end + 1;
                end = end > len ? len : end;
            }
            type = curtype;
        }
        if (!result.length && prefix) {
            temp = previous.concat([prefix]);
            result.push([curtype, cnt + 1, j, temp]);
        }

        //trim result
        for (j = 0; j < result.length; j++) {
            type = result[j][0];
            chunk = result[j][3];
            if (chunk.length > cnt) {
                result[j][3] = chunk.slice(0, cnt + 1);
                index = chunk[cnt].length - 1;

                if (index < result.length) {
                    //console.log('++++++++++++++++++++++++++++++++++++++++');
                    //console.log(cnt, index, chunk);
                    //console.log(cnt, index, chunk, result[index][0], result[index][1], result[index][2], result[index][3]);
                    //console.log('++++++++++++++++++++++++++++++++++++++++');

                    result[j][2] = result[index][2];
                }
            }
        }

        //compact result
        //console.log('----------------------------------------');
        var compact = [], prevInd = -1;
        for (j = 0; j < result.length; j++) {
            type = result[j][0];
            index = result[j][2];
            if (prevInd !== index) {
                compact.push(result[j]);
                //console.log(result[j][0], result[j][1], result[j][2], result[j][3]);
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

    return function (tokens) {
        var matched = [[0, 0, 0, []]];

        //console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
        //console.log(tokens);
        //console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

        matched = matcher.match(tokens, matched);
        matched = matcher.match(tokens, matched);
        matched = matcher.match(tokens, matched);

        //console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        //console.log(matched);
        //console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');

        return matched;
    };
};

