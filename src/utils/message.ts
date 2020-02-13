const getCommand = (str: string) => {
  const reg = new RegExp(/^[a-z]*/);
  const res = str.match(reg);
  if (res) {
    const command = res[0];
    if (command) {
      return {
        command,
        cqData: str.substr(command.length)
      };
    }
  }
  return {
    command: null,
    cqData: str
  };
};

const CqDataToArr = (str: string):ICqMessageRawMessageArr => {
  const arr = Array.from(str);
  const res = [];
  let obj = {};
  let _str = "";
  let isInCq = false;
  let i = 0;
  let total = arr.length;
  while (i < total) {
    const char = arr.shift().trim();
    // 当空字符串的时候进行下一轮循环
    if (char == '') {
      i++
      continue
    }
    if (char === "[") {
      if (!isInCq) {
        // 如果之前不是在cq码中，但是这时匹配到了 '[',则先把前面的字符串作为 text类型
        if (_str.trim()) {
          obj = walk(_str.trim(), "text");
          res.push(obj);
          _str = "";
        }
      }
      // cq码
      _str = `${_str}${char}`;
      isInCq = true;
    }
    if (char === "]") {
      // 处理cq码
      _str = `${_str}${char}`;
      obj = walk(_str, "cq");
      isInCq = false;
      _str = "";
      res.push(obj);
    }
    if (char !== "[" && char !== "]") {
      _str = `${_str}${char}`;
    }
    i++;
  }
  const last = walk(_str.trim(), "text")
  last && res.push(last);
  return res as ICqMessageRawMessageArr;
};

const walk = (str: string, type: string) => {
  const obj = {
    type: "",
    data: {}
  };
  if (!str) return null;
  if (type === "cq") {
    str = str.replace(/\[|\]/g, "");
    const [_type, data] = str.split(",");
    obj.type = _type.split(":")[1];
    const temp = data.split("=");
    obj.data = {
      [`${temp[0]}`]: temp[1].trim()
    };
  } else if (type === "text") {
    obj.type = "text";
    obj.data = {
      text: str
    };
  }
  return obj;
};

const cqStrToArr = (str: string) => {
  // const cmdObj = getCommand(str);
  // const command = cmdObj.command;
  const message = CqDataToArr(str);
  return {
    // command,
    message
  };
};

const toTrim = (message: ICqMessageRawMessageArr) => message.map(msg => {
  if (msg.type === 'text') {
    msg.data.text = msg.data.text.trim()
  }
  return msg
})

export { cqStrToArr, toTrim };
