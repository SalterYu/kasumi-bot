import iconv from "iconv-lite";

const CHERU_SET = '切卟叮咧哔唎啪啰啵嘭噜噼巴拉蹦铃'
const CHERU_DIC: any = {}
const baseStr = '切噜～♪'
Array.from(CHERU_SET).forEach((item, index) => (CHERU_DIC[item] = index))
const MAINREG = /[\u4e00-\u9fa5a-zA-Z0-9]+/g
// let input = `切噜一下??!? ()(@*
// 我是文本 我是*文本`
//
// const input2 = `切噜～♪??!? ()(@*
// 切蹦巴叮拉噜巴啰巴蹦巴哔巴卟噼蹦噼 切蹦巴叮拉噜巴啰巴*切蹦巴哔巴卟噼蹦噼
// `
function group(arr: Array<string>, fillvalue = '') {
  let res = []
  let _arr: string[] = []
  arr.forEach((item, index) => {
    _arr.push(item)
    if (index % 2 === 1) {
      res.push(_arr)
      _arr = []
    }
  })
  // 如果缺少一个字节，就用fillvalue补上，即[02] => [02, 00]
  if (_arr.length > 0) {
    _arr.push(fillvalue)
    res.push(_arr)
  }
  return res
}

function encrypte(str: string) {
  let c = ["切"]
  let e = iconv.encode(str, 'gbk')
  for (let s of e) {
    c.push(CHERU_SET[s & 0xf])
    c.push(CHERU_SET[(s >> 4) & 0xf])
  }
  return c.join('')
}

function decrypte(str: string) {
  let res: number[] = []
  group(Array.from(str).slice(1), '切').forEach(item => {
    let x = CHERU_DIC[item[1]] || 0
    x = x << 4 | CHERU_DIC[item[0]]
    res.push(x)
  })
  return iconv.decode(Buffer.from(res), 'gbk')
}

function strToCheru(str: string) {
  str = str.replace(MAINREG, (_str) => {
    return encrypte(_str)
  })
  return `${baseStr}${str}`
}

function cheruToStr(str: string) {
  str = str.replace(MAINREG, (_str) => {
    return decrypte(_str)
  })
  return str
}

export {
  strToCheru,
  cheruToStr
}

