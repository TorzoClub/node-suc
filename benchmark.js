const Benchmark = require('benchmark');
const Suc = require('./lib/core');

let suite = new Benchmark.Suite;

let sucStr =
  'str >hello, world!\n' +
  '[num] 99932\n' +
  '[num_list]\n1\n67\n5\n'
  '[bool] false\n'
  '[array]\nabc\ncba\nttt'
;
let suc = new Suc;
let parse = function () {
  suc.parse(sucStr);
};

const obj = {
  str: 'hello, world!',
  num: 99932,
  num_list: [1, 67, 5],
  bool: false,
  array: ['abc', 'cba', 'ttt'],
};
let stringify = function () {
  suc.stringify(obj);
};

suite
.add('parse', function () {
  parse();
})
.add('stringify', function () {
  stringify();
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// run async
.run({ 'async': true });
