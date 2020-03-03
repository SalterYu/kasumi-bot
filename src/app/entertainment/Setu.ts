import BasePlugin from '../../core/basePlugin'
import { on_command, toService } from '../../decorator'
import Bot, { Permission } from '../../core'
import axios from 'axios'
import MessageManager from "../../utils/messageManager";

@toService('setu', {
  setu: '发送 来份涩图 来份色图 色图 涩图触发功能'
})
class Setu extends BasePlugin {
  setuUserSet: Set<number>

  constructor(bot: Bot) {
    super(bot)
    this.setuUserSet = new Set<number>()
  }

  async setu(
    event: any,
    data: ICqMessageResponseGroup | ICqMessageResponsePrivate,
  ){
    if (data.message_type === 'private') return
    const userId = data.user_id
    const message = data.raw_message
    if (['来份涩图', '来份色图', '涩图', '色图'].includes(message)) {
      if (this.setuUserSet.has(userId)) {
        return this.sendMessage({
          group_id: data.group_id,
          message: `${MessageManager.at(userId)}你冲太快了，本萝莉觉得你很恶心，休息三分钟再冲吧！！`
        })
      }
      const res = await axios.get('https://api.lolicon.app/setu/?size1200')
      const _data: any = res.data
      const msg: any = await this.sendMessage({
        group_id: data.group_id,
        // message: '色图'
        message: MessageManager.image(_data.data[0].url)
      })
      if (msg && msg.status === 'ok') {
        this.setuUserSet.add(userId)
        setTimeout(() => {
          this.setuUserSet.delete(userId)
        }, 1000 * 60 * 3)
        const messageId = msg.data.message_id
        setTimeout(() => {
          this.deleteMsg(messageId)
        }, 10000)
      }
    }
  }

}

export default Setu
