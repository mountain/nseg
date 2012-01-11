/**
 * hash-builder.js: build hash for dictionary
 *
 * nseg module: Node.js version of MMSEG for Chinese word segmentation
 * https://github.com/mountain/nseg/
 *
 */

function build(words) {
    var hash = {},
        maxlen = -1;

    // Build a simple Hash structure
    for (var i = 0, l = words.length; i < l; i++)  {
        var word = words[i], wordlen = word.length;
        hash[word] = 1;
        if (maxlen < wordlen) {
            maxlen = wordlen;
        }
    }

    hash._ = maxlen;

    return hash;
}


var async = require('asyncjs');

var counterF = 0;
var counterD = 0;
var counterL = 0;
function handleFile(path, list, next) {
    //console.log(path);
    counterF++;
    //console.log('opened files increased:', counterF);
    async
      .files([path])
      .readFile("utf8")
      .each(function (file) {
            var array = file.data.split("\n");
            delete file.data;

            for (var i = 0; i < array.length; i++) {
                list.push(array[i]);
            }
      })
      .end(function (err, result) {
          counterF--;
          //console.log('opened files decreased:', counterF);
          if (err) throw err;
          next();
      });
}

function handleDirs(path, list, next) {
    //console.log(path);
    counterD++;
    //console.log('opened dirs increased:', counterD);
    async
      .readdir(path)
      .stat()
      .each(function (file) {
        if (file.stat.isDirectory()) {
            handleDirs(file.path, list, next);
        } else {
            handleFile(file.path, list, next);
        }
      })
      .end(function (err, result) {
          counterD--;
          //console.log('opened dirs decreased:', counterD);
          if (err) throw err;
          next();
      });
}

function finalStep(output, list, callback) {
    return function () {
        //console.log('check opening:', counterD, counterF, counterL);
        if (counterF === 0 && counterD === 0 && counterL === 0) {
            var ret = 'module.exports = ' + JSON.stringify(build(list));
            require('fs').writeFile(output, ret, "utf8", callback);
        }
    };
}

exports.run = function (output, inputs, callback) {
    var list = [],
        next = finalStep(output, list, callback);
    counterL++;

    if (typeof inputs === 'string') {
        inputs = [inputs];
    }
    async
      .files(inputs)
      .exists()
      .filter(function (file) {
          return file.exists;
      })
      .stat()
      .each(function (file) {
        if (file.stat.isDirectory()) {
            handleDirs(file.path, list, next);
        } else {
            handleFile(file.path, list, next);
        }
      })
      .end(function (err, result) {
          counterL--;
          if (err) throw err;
          next();
      });
};
