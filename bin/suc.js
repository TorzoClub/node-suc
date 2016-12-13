#!/usr/bin/env node

const {package, core} = require(__dirname + '/../');

const yargs = require('yargs')
  .usage("用法: suc [options]")

  .option('j', {
    describe: '将 JSON 转为 SUC'
  })
  .alias('j', 'json')

  .option('o', {
    describe: '设置输出路径，默认为 ./a.*'
  })
  .alias('o', 'output')

  .option('v', {
    describe: '程序版本',
  })
  .alias('v', 'version')

  .help('h')
  .alias('h', 'help')

  .epilog('童装工坊 2016')
;

const argv = yargs.argv;

if (argv.version) {
  console.info(`${package.version}`);
}
