const Suc = require(`${__dirname}/../lib/core.js`);
const should = require('should');

describe('splitLine', () => {
  it('splitLine', () => {
    const suc = new Suc;

    suc.splitLine('abcdefg\njjklj\n').length.should.equal(3);
    suc.splitLine('\n').length.should.equal(2);
    suc.splitLine('').length.should.equal(1);

    suc.splitLine('\r\n')[0].should.equal('')
    suc.splitLine('\n')[0].should.equal('')

    suc.splitLine('\n\r\n')[0].should.equal('')
    suc.splitLine('\n\r\n')[1].should.equal('')
  });
});

describe('注释', () => {
  const suc = new Suc;
  it('注释', () => {
    let obj = suc.parse('#jkaljgklajg');
    Object.keys(obj).length.should.equal(0);
  });
});

describe('空行', () => {
  const suc = new Suc;
  it('略过空行', () => {
    Object.keys(suc.parse('\n\n\n')).length.should.equal(0);
  })
});

describe('字符串模式', () => {
  const suc = new Suc;

  it('未出现赋值语句', () => {
    try { suc.parse('propertyproperty'); }
    catch (e) { e.code.should.equal(1); }
  });
  it('无属性名', () => {
    try { suc.parse('>this is String'); }
    catch (e) { e.code.should.equal(2); }
  });
  it('字符类型', () => {
    const strTest = (property, value, checkProperty = property, checkValue = value) => {
      let obj = suc.parse(`${property}>${value}`);

      obj.should.has.property(checkProperty);
      obj[checkProperty].should.equal(checkValue);
    };
    strTest('ajgkjlagj', 'jalkgjalgkj akgjla   ajklgj lak j lak j ');

    strTest(' \t  prop', 'value', 'prop');
    strTest('prop\t ', 'value', 'prop');
    strTest('   prop\t ', 'value', 'prop');

    strTest('ppp>>>', 'values', 'ppp', '>>>values');
  });
});

describe('数字模式', () => {
  const suc = new Suc;

  it('未闭合的属性括号', () => {
    try { suc.parse('[ppp 5838') }
    catch (e) { e.code.should.equal(10) }
  });

  it('无属性名', () => {
    try { suc.parse('[] 999') }
    catch (e) { e.code.should.equal(11) }
  })

  it('数字的识别', () => {
    let obj = suc.parse('[pppname]  385993');
    obj.should.has.property('pppname').equal(385993);
  });

  it('非法数字', () => {
    try { suc.parse('[pppname] 838 858'); }
    catch (e) { e.code.should.equal(20) }
  });

  it('布尔型的识别', () => {
    suc.parse('[name] true').should.has.property('name').equal(true);
    suc.parse('[name] false').should.has.property('name').equal(false);
  });
  it('非法布尔型', () => {
    try { let obj = suc.parse('[name] ture'); }
    catch (e) { e.code.should.equal(20) }
  });
});

describe('列表模式', () => {
  const suc = new Suc;
  it('未闭合的属性括号', () => {
    try { suc.parse('[ppp 5838') }
    catch (e) { e.code.should.equal(10) }
  });

  it('无属性名', () => {
    try { suc.parse('[] 999') }
    catch (e) { e.code.should.equal(11) }
  })

  it('数组的识别', () => {
    let obj = suc.parse(`[array] \n999\n888\n777\n`);
    obj.should.has.property('array').length(3);
  });
  it('数组元素声明在最后一行', () => {
    let obj = suc.parse(`[array] \n999\n888\n777`);
    obj.should.has.property('array').length(3);
  });
});

describe('stringify', () => {
  const suc = new Suc;
  it('JS 对象转 Suc', () => {
    const obj = {
      num: 999,
      str: 'hello, world!',
      to: [ 'abc@ttt.com', 'bca@a.com', 'z@jjj.com' ],
      bool: true,
      list: [ 83, true, false, 'ajkljag' ],
    };
    let str = suc.stringify(obj);
    str.should.equal(
      `[num] ${obj.num}\n` +
      `str >${obj.str}\n` +

      `[to]\n` +
      obj.to.join('\n') + '\n\n' +

      `[bool] ${obj.bool}\n` +

      `[list]\n` +
      obj.list.join('\n') + '\n'
    );
  });

  it('不支持的类型', () => {
    try { suc.stringify({objProperty: {}}) }
    catch (e) { e.code.should.equal(10) }
  });
  it('列表元素中存在不支持的类型', () => {
    (x => {
      suc.stringify({ array: [ 666, 333, {} ] })
    }).should.throw('列表元素中存在不支持的类型');
  });
});
