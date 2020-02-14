import BasePlugin from "../core/basePlugin";
import Bot, { Permission } from '../core'
import { on_command, toService } from "../decorator";
import Log from "../utils/log";
import { random } from "../utils";

const request = require('request')
let isSearched = false

@toService
class Benghuai extends BasePlugin {
  constructor(bot: Bot) {
    super(bot)
  }

  @on_command('装备查询', {
    vague: true,
    perm: Permission.GROUP
  })
  // @ts-ignore
  async main(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    if (isSearched) return
    if (message[0].type === 'text') {
      const param = message[0].data.text
      const group_id = data.group_id
      request(`https://api.redbean.tech/illustrate/title/${ encodeURIComponent(param) }`, (error: any, response: any, body: any) => {
        const data = JSON.parse(body)
        console.log('data', data)
        if (data) {
          let message = ''
          const fiveStars = data[0]
          const sixStars = data[1]
          if (fiveStars) {
            const { prop1, prop2, rarity, title } = fiveStars
            message = `${ rarity }★${ title }\n技能1：${ prop1.title }\n描述：${ prop1.maxLvDesc }\n`
            if (prop2) {
              message += `技能2：${ prop2.title }\n描述：${ prop2.maxLvDesc }\n`
            }
          }
          if (sixStars) {
            const { prop1, prop2, rarity, title } = sixStars
            message += `${ rarity }★${ title }\n技能1：${ prop1.title }\n描述：${ prop1.maxLvDesc }\n`
            if (prop2) {
              message += `技能2：${ prop2.title }\n描述：${ prop2.maxLvDesc }\n`
            }
          }
          if (message) {
            message += `\n搞事学园提供沙雕技术支持~\n\n1 分钟后可以再次查询`
            isSearched = true
            setTimeout(() => {
              isSearched = false
            }, 60 * 1000)
            return this.sendMessage({
              message,
              group_id
            })
          } else {
            return this.sendMessage({
              message: '没有查询到装备，请输入确切的装备名',
              group_id
            })
          }

        }
      })
    }
  }

  @on_command('魔女十连', {
    perm: Permission.GROUP
  })
  async customGacha(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const _data = await getGacha('custom')
    if (!_data) return
    await this.setGroupBan(data.group_id, data.user_id, random(1, 10) * 60)
    return this.sendMessage({
      message: `魔女祈愿结果\n${_initMessage(_data)}\n搞事学园提供技术支持~`,
      group_id: data.group_id
    })
  }

  @on_command('公主十连', {
    perm: Permission.GROUP
  })
  async highGacha(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const _data = await getGacha('high')
    if (!_data) return
    await this.setGroupBan(data.group_id, data.user_id, random(1, 10) * 60)
    return this.sendMessage({
      message: `公主祈愿结果\n${_initMessage(_data)}\n搞事学园提供技术支持~`,
      group_id: data.group_id
    })
  }

  @on_command('魔法少女十连', {
    perm: Permission.GROUP
  })
  async specialGacha(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const _data = await getGacha('special')
    if (!_data) return
    await this.setGroupBan(data.group_id, data.user_id, random(1, 10) * 60)
    return this.sendMessage({
      message: `魔法少女祈愿结果\n${_initMessage(_data)}\n搞事学园提供技术支持~`,
      group_id: data.group_id
    })
  }

  @on_command('大小姐十连', {
    perm: Permission.GROUP
  })
  async middleGacha(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const _data = await getGacha('middle')
    if (!_data) return
    await this.setGroupBan(data.group_id, data.user_id, random(1, 10) * 60)
    return this.sendMessage({
      message: `大小姐祈愿结果\n${_initMessage(_data)}\n搞事学园提供技术支持~`,
      group_id: data.group_id
    })
  }
}

// high是公主，custom是魔女，middle是大小姐，special是魔法少女
const getGacha = (type: 'high' | 'custom' | 'middle' | 'special' | 'festival'): Promise<{title: string, isGod: boolean}[]> => {
  return new Promise((resolve, reject) => {
    const url = `https://api.redbean.tech/gacha/${type}`
    request(url, (error: any, response: any, body: any)  => {
      if(error) {
        Log.Error(error)
        return resolve(null)
      }
      const res: any = response.body
      if (res) {
        const arr: {title: string, isGod: boolean}[] = JSON.parse(res)
        resolve(arr)
      }
    })
  })
}

const _initMessage = (arr: {title: string, isGod: boolean}[]) => {
  let msg = arr.map(item => {
    return `${item.isGod ? ' [稀有] ' : ''}${item.title}`
  }).join('\n')
  return msg
}

export default Benghuai
