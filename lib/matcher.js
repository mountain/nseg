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

function shallowCopy(src, dest) {
    for (var i = 0, len = src.length; i < len; i++) {
        dest[i] = src[i] + '';
    }
}

function Matcher(dict, filters) {
    this.dict = dict;
    this.filters = filters;
}

Matcher.prototype.match = function (sentence, resultqueue, tempqueue, matched) {
    var results = resultqueue.claim(), prevInd = - 1;

    function copy(elem, j) {
        var index = elem[1];
        if (prevInd !== index) {
            var record = results.take();
            record[0] = elem[0] || 0;
            record[1] = elem[1] || 0;
            record[2] = record[2] || [];
            shallowCopy(elem[2] || [], record[2]);
            //console.log(j, elem[0], elem[1], elem[2]);
        }
        prevInd = index;
    }

    var result, i, j, index, temp, record;

    for (i = 0; i < matched.length; i++) {
        var strct = matched.at(i),
            cnt   = strct[0] || 0,
            pos   = strct[1] || 0,
            chunk = [];

        shallowCopy(strct[2], chunk);

        //console.log('========================================');
        //console.log(i, matched.length, cnt, pos, chunk);
        //console.log(matched.start, matched.array);
        //console.log('========================================');

        var len      = sentence.length,
            start    = pos,
            end      = pos + this.dict._,
            prefix   = '',
            previous = chunk;

        result = tempqueue.claim();
        temp   = [];
        end = end > len  ? len : end;
        if (start === end) {
            //result = [
            //    [chunk.length, pos, chunk]
            //];
            record = result.take();
            record[0] = chunk.length || 0;
            record[1] = pos || 0;
            record[2] = chunk || [];
        }
        for (j = start; j < end; j++) {
            var ch = sentence[j];
            prefix += ch;
            if (this.dict[prefix]) {
                temp = chunk.concat([prefix]);
                //result.push([cnt + 1, j + 1, temp]);
                record = result.take();
                record[0] = cnt + 1;
                record[1] = j + 1;
                record[2] = temp;
                previous = temp;
                //console.log('************************************');
                //console.log(prefix, true, cnt + 1, j + 1, temp);
                //console.log('************************************');
            } else {
                temp = previous.concat([ch]);
                //result.push([cnt + 1, j + 1, temp]);
                record = result.take();
                record[0] = cnt + 1;
                record[1] = j + 1;
                record[2] = temp;
                previous = temp;
                //console.log('************************************');
                //console.log(prefix, false, cnt + 1, j + 1, temp);
                //console.log('************************************');
            }
        }

        //trim result
        for (j = 0; j < result.length; j++) {
            //chunk = result[j][2];
            record = result.at(j);
            chunk = record[2];
            if (chunk.length > cnt) {
                record[2] = chunk.slice(0, cnt + 1);
                index = chunk[cnt].length - 1;

                //console.log('++++++++++++++++++++++++++++++++++++++++');
                //console.log(cnt, index, chunk, result.at(index)[0], result.at(index)[1], result.at(index)[2]);
                //console.log('++++++++++++++++++++++++++++++++++++++++');

                //result[j][1] = result[index][1];
                record[1] = result.at(index)[1];
            }
        }

        //compact result
        //console.log('----------------------------------------');
        //for (j = 0; j < result.length; j++) {
        //    index = result[j][1];
        //    if (prevInd !== index) {
        //        compact.push(result[j]);
        //        //console.log(result[j][0], result[j][1], result[j][2]);
        //    }
        //    prevInd = index;
        //}
        //console.log('----------------------------------------');
        //console.log('----------------------------------------');
        prevInd = - 1;
        result.forEach(copy);
        //console.log('----------------------------------------');
    }

    return results;
};

var StackQueue = require('./util/stack-queue');

module.exports = function (config) {
    var dict = config.dict,
        flts = config.filters,
        matcher = new Matcher(dict, flts);

    return function (sentence, base) {
        base = base || 0;
        var resultqueue = new StackQueue(200);
        var tempqueue   = new StackQueue(1000);
        var matched     = resultqueue.claim();
        matched.push([0, base, []]);

        var matchedNew = matcher.match(sentence, resultqueue, tempqueue, matched);
        resultqueue.dispose(matched);
        tempqueue.clear();
        matched = matchedNew;

        matchedNew = matcher.match(sentence, resultqueue, tempqueue, matched);
        resultqueue.dispose(matched);
        tempqueue.clear();
        matched = matchedNew;

        matchedNew = matcher.match(sentence, resultqueue, tempqueue, matched);
        resultqueue.dispose(matched);
        tempqueue.clear();
        matched = matchedNew;

        return matched.toArray();
    };
};

