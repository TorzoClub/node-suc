node-suc
---

# 这是啥么包？

`Suc 配置文件` 解析器的 NodeJS 实现

# 用法

```javascript
const Suc = require('node-suc').Suc;
let suc = new Suc;

let obj = suc.parse(`
[num] 999

[bool] false

[list]
abc
cba
torzo

string >hello, world!
`);
/*
{
  num: 999,
  bool: false,
  list: [ 'abc', 'cba', 'torzo' ],
  string: 'hello, world!'
}
*/

suc.stringify(obj);
/*
[num] 999
[bool] false
[list]
abc
cba
torzo

string >hello, world!
*/
```
