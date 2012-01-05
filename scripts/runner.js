#!/usr/bin/env node

/**
 * runner.js: command line runner
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

var program     = new (require('commander').Command)('mmseg'),
    triebuilder = require('./trie-builder'),
    freqbuilder = require('./freq-builder'),
    inspector   = require('./inspector'),
    segmenter   = require('./segmenter');

program
  .version(segmenter.VERSION)
  .usage('<command> <options> [inputs]');

program
.command('dict <output> [inputs]')
  .description('build trie tree for user dictionaries')
  .action(function(output, inputs){
      console.log('build trie tree at %s for user dictionaries: %s', output, inputs);
      triebuilder.run(output, inputs);
  }).on('--help', function () {
      console.log('  Examples:');
      console.log();
      console.log('      $ mmseg dict ~/project/data/dict.js ~/dict/dict1.txt ~/dict/dict2.txt');
      console.log('      $ mmseg dict ~/project/data/dict.js ~/dict');
      console.log();
      console.log('  Data format:');
      console.log();
      console.log('      general plain text files containing all vocabularies, one word per line.');
      console.log();
      console.log('  Output:');
      console.log();
      console.log('      A javascript file of the trie structure for all your vocabularies.');
      console.log();
  });

program
.command('freq <output> [inputs]')
  .description('build character-frequency map for user data')
  .action(function(output, inputs){
      console.log('build character-frequency map at %s for user data: %s', output, inputs);
      freqbuilder.run(output, inputs);
  }).on('--help', function () {
      console.log('  Examples:');
      console.log();
      console.log('      $ mmseg freq ~/project/data/freq.js ~/freq/data1.csv ~/freq/data2.csv');
      console.log('      $ mmseg freq ~/project/data/freq.js ~/freq');
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
  .command('seg [text]')
  .description('execute the given remote cmd')
  .option("-d, --dictionary <dict>", "Which dictionary to use")
  .option("-f, --frequency <freq>", "Which frequency map to use")
  .option("-i, --inputs <inputs>", "Which input files or directories to use")
  .option("-o, --output <output>", "Which output file or directory to use")
  .action(function(text, options){
      segmenter.seg(options, text);
  }).on('--help', function () {
      console.log('  Examples:');
      console.log();
      console.log('      $ mmseg seg "石室诗士施氏，嗜食狮，誓食十狮。氏时时适市视狮。"');
      console.log('      $ mmseg seg -i ~/project/text/shi.txt -o ~/project/output/shi.txt');
      console.log('      $ mmseg seg -i ~/project/text/a.txt ~/project/text/b.txt -o ~/project/output');
      console.log('      $ mmseg seg -i ~/project/text -o ~/project/output');
      console.log();
  });

program
  .command('inspect [word]')
  .description('inpect the trie structure of a specified word')
  .option("-d, --dictionary <dict>", "Which dictionary to use")
  .action(function(word, options){
      inspector.inspect(options, word);
  }).on('--help', function () {
      console.log('  Examples:');
      console.log();
      console.log('      $ mmseg inspect "石狮"');
      console.log('      $ mmseg inspect -d ~/project/data/dict.js "石狮"');
      console.log();
  });

program
  .command('check [word]')
  .description('check the trie structure for existence of a specified word')
  .option("-d, --dictionary <dict>", "Which dictionary to use")
  .action(function(word, options){
      inspector.check(options, word);
  }).on('--help', function () {
      console.log('  Examples:');
      console.log();
      console.log('      $ mmseg check "石狮"');
      console.log('      $ mmseg check -d ~/project/data/dict.js "石狮"');
      console.log();
  });

program
.command('help [command]')
  .action(function (command) {
      if (command === 'dict')
          program.parse(['', '', 'dict', '--help'])
      else if (command === 'freq')
          program.parse(['', '', 'freq', '--help'])
      else if (command === 'seg')
          program.parse(['', '', 'seg', '--help'])
      else if (command === 'inspect')
          program.parse(['', '', 'inspect', '--help'])
      else if (command === 'check')
          program.parse(['', '', 'check', '--help'])
      else
          console.log(program.commandHelp());
  });

if (process.argv.length > 2)
    program.parse(process.argv);
else
    console.log(program.commandHelp());

