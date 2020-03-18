import BasePlugin from "../core/basePlugin";
import Bot, { Permission } from "../core";
import { on_command } from "../decorator";


export default class Index extends BasePlugin {
  constructor(bot: Bot) {
    super(bot)
  }


  @on_command('功能列表', {
    perm: Permission.GROUP
  })
  async main(event: any, data: ICqMessageResponseGroup) {
    let msg: string = '功能列表：'
    const group_id = data.group_id
    for (let server of this.$bot.service) {
      const config = server.config
      let enable = (config.enable_group.includes(group_id) && !config.disable_group.includes(group_id))
        || (config.enable_on_default && !config.disable_group.includes(group_id))
      msg += `\n${ enable ? 'on' : 'off' } || ${ (server.serverName || server.name).toLowerCase() }`
    }
    msg += `\n\n使用 开启 | 关闭 指令启动或者禁用`
    msg += '\n输入 功能说明 对应的功能 可以查看详细功能说明'
    return this.sendMessage({
      message: msg,
      group_id: data.group_id
    })
  }

  @on_command("功能说明", {
    perm: Permission.GROUP,
    vague: true
  })
  async actionSpeak(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const group_id = data.group_id
    if (message[0].type === 'text') {
      const _message = message[0].data.text
      const services = Array.from(this.$bot.service)
      const service = services.find(item => item.serverName === _message)
      if (!service) {
        return this.sendMessage({
          group_id,
          message: "这是个啥功能鸭？"
        })
      }
      return this.sendMessage({
        group_id,
        message: `${_message}的功能列表：\n=====================\n${service.actionDes}`
      })
    }
  }

  @on_command("开启", {
    perm: Permission.GROUP_ADMIN,
    vague: true
  })
  async main1(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    if (!message.length) return
    if (message[0].type === 'text') {
      const serverName = message[0].data.text
      const allService = this.$bot.service
      for (let server of allService) {
        if (serverName.toLowerCase() === server.serverName.toLowerCase()) {
          server.setEnableGroup(data.group_id)
          return this.sendMessage({
            message: `启用 ${ serverName } 成功`,
            group_id: data.group_id
          })
        }
      }
    }
  }

  @on_command('关闭', {
    perm: Permission.GROUP_ADMIN,
    vague: true
  })
  async main2(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    if (!message.length) return
    if (message[0].type === 'text') {
      const serverName = message[0].data.text
      const allService = this.$bot.service
      for (let server of allService) {
        if (serverName.toLowerCase() === server.serverName.toLowerCase()) {
          server.setDisableGroup(data.group_id)
          return this.sendMessage({
            message: `禁用 ${ serverName } 成功`,
            group_id: data.group_id
          })
        }
      }
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

  @on_command('广播', {
    perm: Permission.SUPERUSER,
    vague: true
  })
  async broadcast(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const self = this
    const groupList = await this.getGroupList()
    const group_id = data.group_id
    let _message = ''
    if (message[0].type === 'text') _message = message[0].data.text
    const allGroup = groupList.data.filter(item => item.group_id !== group_id).map(item => item.group_id)
    const func = allGroup.map(group_id => {
      return self.sendMessage({
        group_id,
        message: `${ data.raw_message.slice(2).trim() }`
      })
    })
    try {
      await Promise.all(func)
      this.sendMessage({
        message: '广播完毕',
        group_id
      })
    } catch (e) {
      this.sendMessage({
        message: `广播失败, 错误信息: ${ e }`,
        group_id
      })
    }
  }



}
