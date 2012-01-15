/**
 * filter.js: filtering algorithm
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

function mm(chunks) {//maximum matching
    var temp = {}, max = -1;
    for (var i = 0; i < chunks.length; i++) {
        var chunk  = chunks[i],
            length = chunk[2];
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
            count = chunk[1];
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
            count = chunk[1],
            words = chunk[3],
            varnt = 0;

        var lngth = 0;
        for (var j = 0; j < count; j++) {
            var len = words[j].length;
            lngth += len;
        }
        var avrg  = lngth / count;

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

function lsodom(freq, chunks) {//largest sum of degree of morphemic freedom of one-character words
    var temp = {}, max = -1;
    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i],
            count = chunk[1],
            words = chunk[3],
            sodom = 0;

        for (var j = 0; j < count; j++) {
            var word = words[j],
                len = word.length;
            if (len === 1) {
               sodom += Math.log(freq(word) ? freq(word) : 1);
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
    return [chunks[rnd]];
}

function log(chunks) {
    console.log('----------------------------------------');
    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i];
        console.log(chunk[3]);
    }
    console.log('----------------------------------------');
}

module.exports = function (config) {

    var freq = require('./frequency')(config.freq);

    return function (chunks) {
        if (chunks.length === 0) return [0, 0, []];
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

        result = lsodom(freq, result);
        if (result.length === 1) return result[0];

        //console.log('after lsodom');
        //log(result);

        result = random(result);

        //console.log('after random');
        //log(result);

        return result[0];
    };
};
