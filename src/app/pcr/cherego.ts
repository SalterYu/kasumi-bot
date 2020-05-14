import BasePlugin from '../../core/basePlugin'
import { on_command, once, toService } from '../../decorator'
import Bot, { Permission } from '../../core'
import iconv from 'iconv-lite'
import { filterArgText } from "../../utils/message";
import * as Cheru from '../../modules/cherugo'

const baseStr = '切噜～♪'

@toService('切噜语', {
  '切噜语': "输入切噜一下 进行切噜加密通话。切噜～♪开头做切噜语解密。"
})
class Cherugo extends BasePlugin {
  constructor(bot: Bot) {
    super(bot)
  }

  // 切噜语翻译
  async handler(event: any, data: ICqMessageResponseGroup | ICqMessageResponsePrivate) {
    if (data.message_type === 'private') return
    let message = data.raw_message
    if (message.startsWith('切噜一下')) {
      message = filterArgText(message.substr(4))
      return this.sendMessage({
        group_id: data.group_id,
        message: Cheru.strToCheru(message)
      })
    }
    if (message.startsWith(baseStr)) {
      message = message.substr(4) || ''
      return this.sendMessage({
        group_id: data.group_id,
        message: Cheru.cheruToStr(message)
      })
    }
  }

}

export default Cherugo
