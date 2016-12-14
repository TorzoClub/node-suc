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

    /* 空行 */
    if (!cleared.length) {
      if (envir.status === mode.Array) {
        envir.status = null;
        defineHandle({
          [envir.property]: envir.value
        });
        envir.property = '';
        envir.value = null;
      }
      return ;
    }
    /* 数组模式 */
    if (envir.status === mode.Array) {
      envir.value.push(line);
      /* 尾行 */
      if (lineCode + 1 === envir.lines.length) {
        envir.status = null;
        defineHandle({
          [envir.property]: envir.value
        });
        envir.property = '';
        envir.value = null;
      }
      return ;
    }

    /* 判断注释 */
    if (envir.status === null && (cleared[0] === '#' || cleared[0] === ';')) {
      envir.status = mode.Comment;
      return ;
    }

    /* 数字/布尔型/数组 的判断 */
    if (cleared[0] === '[') {
      let propertyNameLength = cleared.search(/]/);
      if (propertyNameLength === -1) {
        throw new SucError(10, lineCode, '未闭合的属性括号');
      } else if (propertyNameLength === 1) {
        throw new SucError(11, lineCode, '无属性名');
      }

      PropertyName = cleared.slice(1, propertyNameLength);

      let rightValue = cleared.slice(propertyNameLength + 1, cleared.length);
      rightValue = rightValue.trim();

      /* 也就是中括号右边有数值 */
      if (rightValue.length) {
        if (rightValue.toLowerCase() === 'true') {
          Value = true;
        } else if (rightValue.toLowerCase() === 'false') {
          Value = false;
        } else {
          Value = Number(rightValue);
          if (isNaN(Value)) {
            throw new SucError(20, lineCode, '非法数字');
          }
        }
        defineHandle({
          [PropertyName]: Value,
        });
        envir.property = '';
        envir.value = null;
      } else {
        envir.status = mode.Array;
        envir.property = PropertyName;
        envir.value = [];
        return ;
      }
    } else {
      let propertyNameLength = cleared.search(/>/);
      if (propertyNameLength === -1) {
        throw new SucError(1, lineCode, '未出现赋值语句');
      } else if (propertyNameLength === 0) {
        throw new SucError(2, lineCode, '无属性名');
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
      lines,
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
