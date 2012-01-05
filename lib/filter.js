/**
 * filter.js: filtering algorithm
 *
 * MMSEG module: Node.js version of MMSEG for Chinese word segmentation
 *
 * https://github.com/mountain/mmseg/
 *
 * By Mingli Yuan <mingli.yuan+mmseg@gmail.com> (http://onecorner.org/)
 *
 * MIT License
 *
 */

var dict = require('./dict');

function mm(chunks) {//maximum matching
    var temp = {}, max = -1;
    for (var i = 0; i < chunks.length; i++) {
        var chunk  = chunks[i],
            length = chunk[1];
        console.log(length, chunk);
        if(temp['l' + length] === undefined) temp['l' + length] = [];
        temp['l' + length].push(chunk);
        if (length > max) max = length;
    }

    return temp['l' + max];
}

function lawl(chunks) {//largest average word length
    var temp = {}, min = 1000;
    for (var i = 0; i < chunks.length; i++) {
        var chunk  = chunks[i],
            count = chunk[0];
        if(temp['c' + count] === undefined) temp['c' + count] = [];
        temp['c' + count].push(chunk);
        if (count < min) min = count;
    }

    return temp['c' + min];
}

function svowl(chunks) {//smallest variance of word lengths
    var temp = {}, min = 10000000;
    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i],
            count = chunk[0],
            lngth = chunk[1],
            words = chunk[2],
            avrg  = lngth / count,
            varnt = 0;

        for (var j = 0; j < count; j++) {
            var len = words[j].length;
            varnt += (len - avrg) * (len - avrg);
        }

        if (varnt < min) min = varnt;

        if(temp['v' + varnt] === undefined) temp['v' + varnt] = [];
        temp['v' + varnt].push(chunk);
    }

    return temp['v' + min];
}

function lsodom(chunks) {//largest sum of degree of morphemic freedom of one-character words
    var temp = {}, max = -1;
    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i],
            count = chunk[0],
            words = chunk[2],
            sodom = 0;

        for (var j = 0; j < count; j++) {
            var word = words[j],
                len = word.length;
            if (len === 1) {
                sodom += Math.log(dict.freq(word));
            }
        }

        if (sodom > max) max = sodom;

        if(temp['s' + sodom] === undefined) temp['s' + sodom] = [];
        temp['s' + sodom].push(chunk);
    }

    return temp['s' + max];
}

function random(chunks) {//randomly choice
    var len = chunks.length,
        rnd = Math.floor(len * Math.random());
    return chunks[rnd];
}

function log(chunks) {
    console.log('----------------------------------------');
    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i];
        console.log(chunk[2]);
    }
    console.log('----------------------------------------');
}

module.exports = function (chunks) {
    if (chunks.length === 1) return chunks[0];

    //console.log('before filtering');
    //log(chunks);

    var result = mm(chunks);
    if (result.length === 1) return result[0];

    //console.log('after mm');
    //log(result);

    result = lawl(result);
    if (result.length === 1) return result[0];

    //console.log('after lawl');
    //log(result);

    result = svowl(result);
    if (result.length === 1) return result[0];

    //console.log('after svowl');
    //log(result);

    result = lsodom(result);
    if (result.length === 1) return result[0];

    //console.log('after lsodom');
    //log(result);

    result = random(result);

    //console.log('after random');
    //log(result);

    return result[0];
};
