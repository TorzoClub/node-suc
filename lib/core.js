/* Suc 解析器 */

const mode = {
  Comment:    Symbol('comment mode（注释模式）'),
  StringLine: Symbol('string line mode（字符行模式）'),
  Normal:     Symbol('normal mode（通常模式）'),
  Array:      Symbol('array mode（数组模式）'),
  Strict:     Symbol('strict mode（严格模式，数字布尔或者列表）'),
};
const SucError = function (code, lineCode, msg) {
  const err = new Error(`第${lineCode}行: ${msg}`);
  err.code = code;
  err.lineCode = lineCode;
  return err;
};

class SucParser {
  splitLine(str){
    return str.split(/\n/g);
  }
  cleanBeforeBlank(str){
    return str.replace(/^( |\t)*/g, '');
  }
  readLine(envir, line, lineCode, defineHandle){
    const cleared = this.cleanBeforeBlank(line);

    let PropertyName = '';
    let Value;

    /* 判断注释 */
    if (envir.status === null && (cleared[0] === '#' || cleared[0] === ';')) {
      envir.status = mode.Comment;
      return ;
    }

    /* 数字/布尔型/数组 的判断 */
    if (cleared[0] === '[') {
      envir.status = mode.Strict;
    } else {
      let propertyNameLength = cleared.search(/>/);
      if (propertyNameLength === -1) {
        throw new SucError(-1, lineCode, '未出现赋值语句');
      } else if (propertyNameLength === 0) {
        throw new SucError(-2, lineCode, '无属性名');
      }

      PropertyName = cleared.slice(0, propertyNameLength);
      PropertyName = PropertyName.trim();

      Value = cleared.slice(propertyNameLength + 1, cleared.length);

      defineHandle({
        [PropertyName]: Value,
      });
      envir.property = '';
      envir.value = null;
    }

  }
  fetchLine(lines){
    const envir = {
      status: null,
      property: '',
      value: null,
    };
    const target = {};

    lines.forEach((line, lineCode) => {
      this.readLine(envir, line, lineCode, (define) => {
        Object.assign(target, define);
      });
    });

    return target;
  }
  constructObject(str){
    this.lines = this.splitLine(str);
  }
}

class SucStringify extends SucParser {

}

class Suc extends SucStringify {
  parse(str){
    this.raw = str;
    this.constructObject(str);

    return this.fetchLine(this.lines);
  }
}

module.exports = Suc;
