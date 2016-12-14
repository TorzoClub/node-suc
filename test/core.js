const Suc = require(`${__dirname}/../lib/core.js`);
const should = require('should');

describe('splitLine', () => {
  it('splitLine', () => {
    const suc = new Suc;

    suc.splitLine('abcdefg\njjklj\n').length.should.equal(3);
    suc.splitLine('\n').length.should.equal(2);
    suc.splitLine('').length.should.equal(1);
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
