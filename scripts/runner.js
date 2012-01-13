#!/usr/bin/env node

/**
 * runner.js: command line runner
 *
 * nseg module: Node.js version of MMSEG for Chinese word segmentation
 *
 * https://github.com/mountain/nseg/
 *
 * By Mingli Yuan <mingli.yuan+mmseg@gmail.com> (http://onecorner.org/)
 *
 * MIT License
 *
 */

var program     = new (require('commander').Command)('nseg'),
    hashbuilder = require('./hash-builder'),
    freqbuilder = require('./freq-builder'),
    inspector   = require('./inspector'),
    filehandler = require('./file-handler');

program
  .version(filehandler.VERSION)
  .usage('<command> <options> [inputs]');

program
.command('dict <output> [inputs]')
  .description('build hash structure from user dictionaries')
  .action(function (output, inputs) {
      hashbuilder.run(output, inputs);
  }).on('--help', function () {
      console.log('  Examples:');
      console.log();
      console.log('      $ nseg dict ~/project/data/dict.js ~/dict/dict1.txt ~/dict/dict2.txt');
      console.log('      $ nseg dict ~/project/data/dict.js ~/dict');
      console.log();
      console.log('  Data format:');
      console.log();
      console.log('      general plain text files containing all vocabularies, one word per line.');
      console.log();
      console.log('  Output:');
      console.log();
      console.log('      A javascript file of the hash structure for all your vocabularies.');
      console.log();
  });

program
.command('freq <output> [inputs]')
  .description('build character-frequency map from user data')
  .action(function (output, inputs) {
      freqbuilder.run(output, inputs);
  }).on('--help', function () {
      console.log('  Examples:');
      console.log();
      console.log('      $ nseg freq ~/project/data/freq.js ~/freq/data1.csv ~/freq/data2.csv');
      console.log('      $ nseg freq ~/project/data/freq.js ~/freq');
      console.log();
      console.log('  Data format:');
      console.log();
      console.log('      general csv files containing all character-frequency pairs.');
      console.log();
      console.log('  Output:');
      console.log();
      console.log('      A javascript file of the character-frequency map.');
      console.log();
  });

program
  .command('segf')
  .description('segment a file')
  .option("-d, --dictionary <dict>", "Which dictionary to use")
  .option("-f, --frequency <freq>", "Which frequency map to use")
  .option("-i, --inputs <inputs>", "Which input file to use")
  .option("-o, --output <output>", "Which output file to use")
  .action(function (options) {
      filehandler.segf(options);
  }).on('--help', function () {
      console.log('  Examples:');
      console.log();
      console.log('      $ nseg segf -i ~/project/input/a.txt -o ~/project/output/b.txt');
      console.log();
  });

program
  .command('segd')
  .description('segment all files in a directory')
  .option("-d, --dictionary <dict>", "Which dictionary to use")
  .option("-f, --frequency <freq>", "Which frequency map to use")
  .option("-i, --inputs <inputs>", "Which input directories to use")
  .option("-o, --output <output>", "Which output directory to use")
  .action(function (options) {
      filehandler.segd(options);
  }).on('--help', function () {
      console.log('  Examples:');
      console.log();
      console.log('      $ nseg segd -i ~/project/input -o ~/project/output');
      console.log();
  });

program
  .command('check [word]')
  .description('check the hash structure for existence of a specified word')
  .option("-d, --dictionary <dict>", "Which dictionary to use")
  .action(function (word, options) {
      inspector.check(options.dictionary, word);
  }).on('--help', function () {
      console.log('  Examples:');
      console.log();
      console.log('      $ nseg check "石狮"');
      console.log('      $ nseg check -d ~/project/data/dict.js "石狮"');
      console.log();
  });

program
.command('help [command]')
  .action(function (command) {
      if (command === 'dict')
          program.parse(['', '', 'dict', '--help'])
      else if (command === 'freq')
          program.parse(['', '', 'freq', '--help'])
      else if (command === 'segf')
          program.parse(['', '', 'segf', '--help'])
      else if (command === 'segd')
          program.parse(['', '', 'segd', '--help'])
      else if (command === 'check')
          program.parse(['', '', 'check', '--help'])
      else
          console.log(program.commandHelp());
  });

if (process.argv.length > 2)
    program.parse(process.argv);
else
    program.parse(['', '', '--help'])

