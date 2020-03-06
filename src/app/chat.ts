import BasePlugin from '../core/basePlugin'
import { on_command, toService } from '../decorator'
import Bot, { checkPerm, Permission } from '../core'
import * as Path from "path";
import * as Fs from 'fs'
import { IAnyObject } from "../../typings";
import MessageManager from "../utils/messageManager";

const mkdirp = require('mkdirp')

let retellMap = new Map()

@toService('趣聊', {
  '1.有人问你答': '用 有人问xxx你答xxx 的形式 可以教本萝莉说话哟，不要乱教我！！',
  '2.添加规则': "添加一个自动回复规则，支持正则表达式，①例如：添加规则 re: /\d{3}/===我是一个正则, 则匹配到任何有连续3次的数字就会回复我是一个正则(此功能需要管理员权限)；" +
    "②例如 添加规则 abc===efg, 则如果有任何文字内容包含abc就会回复efg",
  '3.其他隐藏功能': '慢慢发现(x'
})
class Chat extends BasePlugin {
  constructor(bot: Bot) {
    super(bot)
  }

  @on_command('禁言', {
    perm: Permission.GROUP_ADMIN
  })
  async groupBan(
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
  async setAdmin(
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
  async cancelAdmin(
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
  async signIn(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    return this.sendMessage({
      group_id: data.group_id,
      message: '签到个🔨'
    })
  }

  @on_command('我好了', {
    perm: Permission.GROUP
  })
  async shele(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
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
  async unsetGroupBan(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const at: any = message.find(mes => mes.type === 'at')
    if (at) {
      const user_id: any = at.data.qq
      const group_id = data.group_id
      await this.setGroupBan(group_id, user_id, 0)
    }
  }

  @on_command('mua')
  async mua(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const group_id = data.group_id
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
  async delMsg(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    if (message[0].type === 'text') {
      const messageId = +(message[0].data.text)
      console.log(messageId)
      if (messageId) return this.deleteMsg(+messageId)
    }

  }

  @on_command('来一份优质睡眠套餐', {
    perm: Permission.GROUP
  })
  async sleep(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    await this.setGroupBan(data.group_id, data.user_id, 8 * 60 * 60)
  }

  // 规则回复
  @on_command('*', {
    perm: Permission.GROUP_ADMIN
  })
  async ruleHandler(event: any, data: ICqMessageResponseGroup | ICqMessageResponsePrivate) {
    if (data.message_type === 'private') return
    let message = data.raw_message
    const rule = readRuleJson()
    const _sendErrorMsg = () => this.sendMessage({
      group_id: data.group_id,
      message: "添加规则的格式不正确，应为：添加规则 re: [key]===[value]的格式"
    })
    if (message.startsWith('添加规则')) {
      let _message = message.slice(4).trim()

      // 表示正则表达式
      if (_message.startsWith('re:') || _message.startsWith('re：')) {
        _message = _message.slice(3).trim()
        if (/[^=]={3}[^=]/.test(_message)) {
          const strArr = _message.split('===')
          if (strArr.length > 2) {
            return _sendErrorMsg()
          }
          const [key, value] = strArr
          const existObj = rule.find((item: any) => item.key === key.substring(1, key.length - 1))
          if (value) {
            if (existObj) {
              existObj.value = value
            } else {
              rule.push({
                type: 'reg',
                key: key.substring(1, key.length - 1),
                value
              })
            }
            saveRuleJson(rule)
          }
          return this.sendMessage({
            message: 'はい☆',
            group_id: data.group_id
          })
        }
      } else if (/[^=]={3}[^=]/.test(_message)) {
        const strArr = _message.split('===')
        if (strArr.length > 2) {
          return _sendErrorMsg()
        }
        const [key, value] = strArr
        const existObj = rule.find((item: any) => item.key === key)
        if (value) {
          if (existObj) {
            existObj.value = value
          } else {
            rule.push({
              type: '',
              key,
              value
            })
          }
          saveRuleJson(rule)
        }
        return this.sendMessage({
          message: 'はい☆',
          group_id: data.group_id
        })
      } else {
        _sendErrorMsg()
      }
    }

    if (message.startsWith('删除规则')) {
      let _message = message.slice(4).trim()
      const target = rule.find((item: any) => item.key === _message)
      const _rule = rule.filter((item: any) => item.key !== _message)
      saveRuleJson(_rule)
      if (target) {
        this.sendMessage({
          group_id:data.group_id,
          message: '删除规则成功~'
        })
      } else {
        this.sendMessage({
          group_id:data.group_id,
          message: '删除规则失败，没有这个规则哟~'
        })
      }

    }

    rule.forEach((item: any) => {
      const {type, key, value} = item
      if (type === 'reg') {
        const reg = new RegExp(key)
        if (reg.test(message)) {
          return this.sendMessage({
            group_id: data.group_id,
            message: `${value.replace('$userName', MessageManager.at(data.user_id))}`
          })
        }
      } else {
        if (message.includes(key)) {
          return this.sendMessage({
            group_id: data.group_id,
            message: `${value.replace('$userName', MessageManager.at(data.user_id))}`
          })
        }
      }
    })
  }

  async repeatHandler(event: any, data: ICqMessageResponseGroup) {
    if (!data.group_id) return
    let message = data.raw_message
    const repeat = readRepeatJson()
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

    // // 读取规则表
    // rule.forEach((item: any) => {
    //   const { type, key, value } = item
    //   if (type === 'reg') {
    //     const reg = new RegExp(key)
    //     if (reg.test(message)) {
    //       return this.sendMessage({
    //         group_id: data.group_id,
    //         message: value
    //       })
    //     }
    //   } else {
    //     if (message.includes(key)) {
    //       console.log(111)
    //     }
    //   }
    // })
    // 读取回复
    Object.keys(repeat).forEach(key => {
      if (key === message) {
        return this.sendMessage({
          message: repeat[key].replace('$userName', MessageManager.at(data.user_id)),
          group_id: data.group_id
        })
      }
    })
  }

  // 群复读功能
  async retell(event: any, data: ICqMessageResponseGroup | ICqMessageResponsePrivate) {
    if (data.message_type === 'private') return
    const message = data.raw_message
    const group_id = data.group_id
    let retellData = retellMap.get(group_id)
    if (!retellData) retellMap.set(group_id, { message, count: 0 })
    retellData = retellMap.get(group_id)
    if (retellData.message === message) {
      retellData.count = retellData.count + 1
    } else {
      retellMap.set(group_id, { message, count: 1 })
    }
    if (retellData.count === 3) {
      retellMap.set(group_id, { message, count: 0 })
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

function saveRuleJson(data: IAnyObject) {
  const path = Path.join(__dirname, '../.koishi/repeat', `rule.json`)
  Fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
}

function readRuleJson() {
  const path = Path.join(__dirname, '../.koishi/repeat', `rule.json`)
  if (!Fs.existsSync(path)) {
    mkdirp.sync(Path.join(__dirname, '../.koishi/repeat'))
    Fs.writeFileSync(path, JSON.stringify([], null, 2), 'utf8')
  }
  const res = JSON.parse(Fs.readFileSync(path, 'utf8'))
  return res
}

export default Chat
