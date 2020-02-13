import BasePlugin from "../core/basePlugin";
import Bot, { Permission } from "../core";
import { on_command } from "../decorator";

export default class Index extends BasePlugin{
  constructor(bot: Bot) {
    super(bot)
  }


  @on_command('lssv', {
    perm: Permission.GROUP
  })
  async main(event: any, data: ICqMessageResponseGroup) {
    let msg: string = '功能列表：'
    const group_id = data.group_id
    for(let server of this.$bot.service) {
      const config = server.config
      let enable = (config.enable_group.includes(group_id) && !config.disable_group.includes(group_id))
        || (config.enable_on_default && !config.disable_group.includes(group_id))
      msg += `\n${enable ? 'on' : 'off'} || ${server.serverName.toLowerCase()}`
    }
    msg += `\n\n使用 enable | disable 指令启动或者禁用`
    return this.sendMessage({
      message: msg,
      group_id: data.group_id
    })
  }

  @on_command('enable', {
    perm: Permission.GROUP_ADMIN,
    vague: true
  })
  async main1(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    if (message[0].type === 'text') {
      const serverName = message[0].data.text
      const allService = this.$bot.service
      for (let server of allService) {
        if (serverName.toLowerCase() === server.serverName.toLowerCase()) {
          server.setEnableGroup(data.group_id)
          return this.sendMessage({
            message: `启用 ${serverName} 成功`,
            group_id: data.group_id
          })
        }
      }
    }
  }

  @on_command('disable', {
    perm: Permission.GROUP_ADMIN,
    vague: true
  })
  async main2(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    if (message[0].type === 'text') {
      const serverName = message[0].data.text
      const allService = this.$bot.service
      for (let server of allService) {
        if (serverName.toLowerCase() === server.serverName.toLowerCase()) {
          server.setDisableGroup(data.group_id)
          return this.sendMessage({
            message: `禁用 ${serverName} 成功`,
            group_id: data.group_id
          })
        }
      }
    }
  }
}
