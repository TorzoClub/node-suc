/* Suc 解析器 */

const mode = {
  Comment:    Symbol('comment mode（注释模式）'),
  StringLine: Symbol('string line mode（字符行模式）'),
  Normal:     Symbol('normal mode（通常模式）'),
  Array:      Symbol('array mode（数组模式）'),
  Strict:     Symbol('strict mode（严格模式，数字布尔或者列表）'),
};
const SucParseError = function (code, lineCode, msg) {
  const err = new Error(`第${lineCode}行: ${msg}`);
  err.code = code;
  err.lineCode = lineCode;
  return err;
};
const SucStringifyError = function ({code, property, value, type, msg}) {
  const err = new Error(msg);

  Object.assign(err, {
    code, property, value, type, msg
  });

  return err;
};

class SucParser {
  splitLine(str){
    return str.split(/\r\n|\n/g);
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
        defineHandle(envir.property, envir.value);
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
        defineHandle(envir.property, envir.value);
        envir.property = '';
        envir.value = null;
      }
      return ;
    }

    /* 判断注释 */
    if (envir.status === null && (cleared[0] === '#' || cleared[0] === ';')) {
      /* envir.status = mode.Comment; */
      return ;
    }

    /* 数字/布尔型/数组 的判断 */
    if (cleared[0] === '[') {
      let propertyNameLength = cleared.search(/]/);
      if (propertyNameLength === -1) {
        throw new SucParseError(10, lineCode, '未闭合的属性括号');
      } else if (propertyNameLength === 1) {
        throw new SucParseError(11, lineCode, '无属性名');
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
            throw new SucParseError(20, lineCode, '非法数字');
          }
        }
      } else {
        envir.status = mode.Array;
        envir.property = PropertyName;
        envir.value = [];
        return ;
      }
    } else {
      let propertyNameLength = cleared.search(/>/);
      if (propertyNameLength === -1) {
        throw new SucParseError(1, lineCode, '未出现赋值语句');
      } else if (propertyNameLength === 0) {
        throw new SucParseError(2, lineCode, '无属性名');
      }

      PropertyName = cleared.slice(0, propertyNameLength);
      PropertyName = PropertyName.trim();

      Value = cleared.slice(propertyNameLength + 1, cleared.length);
    }

    defineHandle(PropertyName, Value);
    envir.property = '';
    envir.value = null;
  }
  fetchLine(lines){
    const envir = {
      status: null,
      property: '',
      value: null,
      lines,
    };
    const target = {};
    for (let lineCode=0; lineCode < lines.length; ++lineCode) {
      this.readLine(envir, lines[lineCode], lineCode, (property, value) => {
        target[property] = value;
      });
    }

    return target;
  }
  constructObject(str){
    this.lines = this.splitLine(str);
  }
}

class SucStringify extends SucParser {
  stringify(obj){
    let str = '';
    Object.keys(obj).forEach((property, cursor, total) => {
      const value = obj[property];
      const type = typeof(value);

      if (type === 'string') {
        str += `${property} >${value}`;
      } else if (type === 'number' || type === 'boolean') {
        str += `[${property}] ${value}`;
      } else if (type === 'object' && Array.isArray(value)) {
        str += `[${property}]\n`;
        str += value.reduce((item, item2) => {
          if (typeof(item) === 'object' || typeof(item2) === 'object') {
            throw new SucStringifyError({
              code: 11,
              msg: '列表元素中存在不支持的类型',
              property, value, type,
            });
          }
          return `${item}\n` + `${item2}`;
        });
        str += '\n';
      } else {
        throw new SucStringifyError({
          code: 10,
          msg: '转换项中存在不支持的类型',
          property,
          value,
          type,
        });
      }

      /* 如果不是最后一个项目 */
      if ((cursor + 1) !== total.length) {
        str += '\n';
      }
    });
    return str;
  }
}

class Suc extends SucStringify {
  parse(str){
    this.raw = str;
    this.constructObject(str);

    return this.fetchLine(this.lines);
  }
}

module.exports = Suc;
