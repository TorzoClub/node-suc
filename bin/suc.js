#!/usr/bin/env node

const {package, Suc} = require(__dirname + '/../');
const suc = new Suc;

const fs = require('fs');

const yargs = require('yargs')
  .usage("用法: suc [command] [option]")
  .option('o', {
    describe: '设置输出路径，默认为 ./a.*'
  })
  .alias('o', 'output')

  //.command('parse', '将 Suc 转为 JSON')
  .command(['parse [filepath]'], '将 Suc 转为 JSON', {}, (argv) => {
    if (argv.filepath) {
      let sucStr = fs.readFileSync(argv.filepath).toString();

      let obj = suc.parse(sucStr);
      let jsonStr = JSON.stringify(obj, '', '  ');
      if (argv.o) {
        if (typeof(argv.o) === 'boolean') {
          argv.o = 'a.json';
        }
        fs.writeFileSync(argv.o, jsonStr);
      } else {
        console.log(jsonStr);
      }
    } else {
      console.error('未指定 Suc 文件');
    }
  })

  .command('compile [filepath]', '将 JSON 转为 Suc', {}, (argv) => {
    if (argv.filepath) {
      let jsonStr = fs.readFileSync(argv.filepath).toString();
      const obj = JSON.parse(jsonStr);
      let str = suc.stringify(obj);

      if (argv.o) {
        if (typeof(argv.o) === 'boolean') {
          argv.o = 'a.suc';
        }
        fs.writeFileSync(argv.o, str);
      } else {
        console.log(str);
      }
    } else {
      console.error('未指定 JSON 文件');
    }
  })

  .command('list', '查看 SUC 库')
  .command('view', '查看 SUC 库中的项目')
  .command('save', '保存 SUC 文件到库中')

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
