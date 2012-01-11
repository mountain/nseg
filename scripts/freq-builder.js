/**
 * freq-builder.js: build character frequency map
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

var async = require('asyncjs');

var counterF = 0;
var counterD = 0;
var counterL = 0;
function handleFile(path, freq, next) {
    //console.log(path);
    counterF++;
    //console.log('opened files increased:', counterF);
    async
    .files([path])
      .readFile("utf8")
      .each(function (file) {
            var list = file.data.replace(/\n/g, ",").split(",");
            delete file.data;

            for (var i = 0; i < list.length;) {
                var ch = list[i + 1];
                if (ch) {
                    freq[ch] = parseInt(list[i], 10);
                }
                i = i + 2;
            }
      })
      .end(function (err, result) {
          counterF--;
          //console.log('opened files decreased:', counterF);
          if (err) throw err;
          next();
      });
}

function handleDirs(path, freq, next) {
    //console.log(path);
    counterD++;
    //console.log('opened dirs increased:', counterD);
    async
      .readdir(path)
      .stat()
      .each(function (file) {
        if (file.stat.isDirectory()) {
            handleDirs(file.path, freq, next);
        } else {
            handleFile(file.path, freq, next);
        }
      })
      .end(function (err, result) {
          counterD--;
          //console.log('opened dirs decreased:', counterD);
          if (err) throw err;
          next();
      });
}

function finalStep(output, freq, callback) {
    return function () {
        //console.log('check opening:', counterD, counterF, counterL);
        if (counterF === 0 && counterD === 0 && counterL === 0) {
            var ret = 'module.exports = ' + JSON.stringify(freq);
            require('fs').writeFile(output, ret, "utf8", callback);
        }
    };
}

exports.run = function (output, inputs, callback) {
    var freq = {},
        next = finalStep(output, freq, callback);
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
            handleDirs(file.path, freq, next);
        } else {
            handleFile(file.path, freq, next);
        }
      })
      .end(function (err, result) {
          counterL--;
          if (err) throw err;
          next();
      });
};
