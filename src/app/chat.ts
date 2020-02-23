import BasePlugin from '../core/basePlugin'
import { on_command, toService } from '../decorator'
import Bot, { checkPerm, Permission } from '../core'
import * as Path from "path";
import * as Fs from 'fs'
import { IAnyObject } from "../../typings";
const mkdirp = require('mkdirp')

let retellMap = new Map()

@toService
class Chat extends BasePlugin {
  constructor(bot: Bot) {
    super(bot)
  }

  @on_command('禁言', {
    perm: Permission.GROUP
  })
  async main2(
    event: any,
    data: ICqMessageResponseGroup,
    message: ICqMessageRawMessageArr
  ) {
    const { superUsers } = this.$bot.config
    const user_id = data.user_id
    const group_id = data.group_id
    if (!superUsers.includes(user_id)) {
      return this.sendMessage({
        message: '权限不足',
        group_id: group_id,
      })
    }
    const at = message.find(mes => mes.type === 'at')
    if (at && at.type === 'at') {
      return this.setGroupBan(group_id, +at.data.qq, 1 * 60)
    }
  }

  @on_command('设置管理员', {
    perm: Permission.GROUP_ADMIN,
  })
  async main3(
    event: any,
    data: ICqMessageResponseGroup,
    message: ICqMessageRawMessageArr
  ) {
    const { superUsers } = this.$bot.config
    const user_id = data.user_id
    const group_id = data.group_id
    if (!superUsers.includes(user_id)) {
      return this.sendMessage({
        message: '权限不足',
        group_id: group_id,
      })
    }
    const at: any = message.find(mes => mes.type === 'at')
    if (at) {
      const atQQ: any = at.data.qq
      return this.setGroupAdmin(group_id, atQQ, true)
    }
  }

  @on_command('取消管理员', {
    perm: Permission.GROUP_ADMIN,
  })
  async main4(
    event: any,
    data: ICqMessageResponseGroup,
    message: ICqMessageRawMessageArr
  ) {
    const at: any = message.find(mes => mes.type === 'at')
    if (at) {
      const user_id: any = at.data.qq
      const group_id = data.group_id
      return this.setGroupAdmin(group_id, user_id, false)
    }
  }

  @on_command('签到', {
    perm: Permission.GROUP
  })
  async main5(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    return this.sendMessage({
      group_id: data.group_id,
      message: '签到个🔨'
    })
  }

  @on_command('我好了', {
    perm: Permission.GROUP
  })
  async main6(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const { superUsers } = this.$bot.config
    await this.sendMessage({
      group_id: data.group_id,
      message: "不准好，憋回去！"
    })
    if (!superUsers.includes(data.user_id)) {
      await this.setGroupBan(data.group_id, data.user_id, 300)
    }
  }

  @on_command('解除禁言', {
    perm: Permission.GROUP_ADMIN
  })
  async main7(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const at: any = message.find(mes => mes.type === 'at')
    if (at) {
      const user_id: any = at.data.qq
      const group_id = data.group_id
      await this.setGroupBan(group_id, user_id, 0)
    }
  }

  @on_command('mua')
  async main8(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const group_id = data.group_id
    return await this.sendMessage({
      group_id,
      message: '嘤嘤嘤(╥╯^╰╥)'
    })
    if (checkPerm(this.$bot, data, Permission.SUPERUSER)) {
      await this.sendMessage({
        group_id,
        message: '嘤嘤嘤(╥╯^╰╥)'
      })
    } else {
      await this.sendMessage({
        group_id,
        message: '爬！'
      })
    }

  }

  @on_command('撤回消息', {
    perm: Permission.GROUP,
    vague: true
  })
  async main9(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    if (message[0].type === 'text') {
      const messageId = +(message[0].data.text)
      console.log(messageId)
      if (messageId) return this.deleteMsg(+messageId)
    }

  }

  // @on_command('爬', {
  //   perm: [Permission.GROUP],
  //   vague: true
  // })
  // async main10(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
  //   return this.sendMessage({
  //     message: '爬爬爬',
  //     group_id: data.group_id
  //   })
  // }

  // @on_command('?', {
  //   perm: [Permission.GROUP]
  // })
  // async main11(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
  //   return this.sendMessage({
  //     message: '¿ ¿ ¿ ？？？',
  //     group_id: data.group_id
  //   })
  // }
  //
  // @on_command('？', {
  //   perm: [Permission.GROUP]
  // })
  // async main12(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
  //   return this.sendMessage({
  //     message: '？？？¿ ¿ ¿ ',
  //     group_id: data.group_id
  //   })
  // }

  @on_command('来一份优质睡眠套餐', {
    perm: Permission.GROUP
  })
  async main13(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    await this.setGroupBan(data.group_id, data.user_id, 8 * 60 * 60)
  }

  async handler(event: any, data: ICqMessageResponseGroup) {
    if (!data.group_id) return
    let message = data.raw_message
    const repeat = readRepeatJson()
    Object.keys(repeat).forEach(key => {
      if (key === message) {
        return this.sendMessage({
          message: repeat[key],
          group_id: data.group_id
        })
      }
    })

    if (message.startsWith('有人问')) {
      message = message.substr(3)
      if (message.indexOf('你答')) {
        const arr = message.split('你答')
        if (arr.length === 1) {
          return this.sendMessage({
            message: `格式错啦，用 有人问xxx你答xxx 的形式`,
            group_id: data.group_id
          })
        }
        const [key, value] = arr
        repeat[key] = value
        saveRepeatJson(repeat)
        return this.sendMessage({
          message: 'はい☆',
          group_id: data.group_id
        })
      }
    }

    if (message.startsWith('不要再回答')) {
      message = message.substr(5)
      let exist = false
      const keys = Object.keys(repeat)
      for (let key of keys) {
        if (key === message) {
          exist = true
        }
      }
      if (!exist) return
      delete repeat[message]
      saveRepeatJson(repeat)
      return this.sendMessage({
        message: 'わかりました☆',
        group_id: data.group_id
      })
    }
  }

  // 群复读功能
  async retell(event: any, data: ICqMessageResponseGroup | ICqMessageResponsePrivate) {
    if (data.message_type === 'private') return
    const message = data.raw_message
    const group_id = data.group_id
    let retellData = retellMap.get(group_id)
    if (!retellData) retellMap.set(group_id, {message, count: 0})
    retellData = retellMap.get(group_id)
    if (retellData.message === message) {
      retellData.count = retellData.count + 1
    } else {
      retellMap.set(group_id, {message, count: 1})
    }
    if (retellData.count === 3) {
      retellMap.set(group_id, {message, count: 0})
      const res = await this.sendMessage({
        message,
        group_id
      })
      if (res.status === 'failed') {
        retellMap.delete(group_id)
      }
    }
  }
}

function readRepeatJson() {
  const path = Path.join(__dirname, '../.koishi/repeat', `index.json`)
  if (!Fs.existsSync(path)) {
    mkdirp.sync(Path.join(__dirname, '../.koishi/repeat'))
    Fs.writeFileSync(path, JSON.stringify({}), 'utf8')
  }
  const res = JSON.parse(Fs.readFileSync(path, 'utf8'))
  return res
}

function saveRepeatJson(data: IAnyObject) {
  const path = Path.join(__dirname, '../.koishi/repeat', `index.json`)
  Fs.writeFileSync(path, JSON.stringify(data), 'utf8')
}

export default Chat
