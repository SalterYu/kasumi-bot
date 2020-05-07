import BasePlugin from '../../core/basePlugin'
import { on_command, once, toService } from '../../decorator'
import Bot, { Permission } from '../../core'
import iconv from 'iconv-lite'

const CHERU_SET = '切卟叮咧哔唎啪啰啵嘭噜噼巴拉蹦铃'
const CHERU_DIC: any = {}
const baseStr = '切噜～♪'
Array.from(CHERU_SET).forEach((item, index) => (CHERU_DIC[item] = index))
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
  if (_arr.length > 0) {
    _arr.push(fillvalue)
    res.push(_arr)
  }
  return res
}

function word2cheru(str: string) {
  let c = ["切"]
  let e = iconv.encode(str, 'gbk')
  for (let s of e) {
    c.push(CHERU_SET[s & 0xf])
    c.push(CHERU_SET[(s >> 4) & 0xf])
  }
  return baseStr + c.join('')
}

function cheru2word(str: string) {
  if (!str) return
  str = str.replace(baseStr, '')
  let res: Array<number> = []
  group(Array.from(str).slice(1), '切').forEach(item => {
    let x = CHERU_DIC[item[1]] || 0
    x = x << 4 | CHERU_DIC[item[0]]
    res.push(x)
  })
  return iconv.decode(Buffer.from(res), 'gbk')
}

@toService('切噜语', {
  '切噜语': "输入切噜一下 进行切噜加密通话。切噜～♪开头做切噜语解密。"
})
class Cherego extends BasePlugin {
  constructor(bot: Bot) {
    super(bot)
  }

  // 切噜语翻译
  async handler(event: any, data: ICqMessageResponseGroup | ICqMessageResponsePrivate) {
    if (data.message_type === 'private') return
    let message = data.raw_message
    if (message.startsWith('切噜一下')) {
      message = message.substr(4)
      return this.sendMessage({
        group_id: data.group_id,
        message: word2cheru(message)
      })
    }
    if (message.startsWith(baseStr)) {
      message = message.substr(4)
      return this.sendMessage({
        group_id: data.group_id,
        message: cheru2word(message)
      })
    }
  }

}

export default Cherego
