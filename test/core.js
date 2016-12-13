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
})

describe('字符串模式', () => {
  const suc = new Suc;

  it('未出现赋值语句', () => {
    try { suc.parse('propertyproperty'); }
    catch (e) { e.code.should.equal(-1); }
  });
  it('无属性名', () => {
    try { suc.parse('>this is String'); }
    catch (e) { e.code.should.equal(-2); }
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
})
