import BasePlugin from "../core/basePlugin";
import Bot, { checkPerm, Permission } from '../core'
import { on_command, toService } from "../decorator";
import Log from "../utils/log";
import { addDelay, delay, deleteDelay, random } from "../utils";
import axios from "axios";

const request = require('request')
let isSearched = false

interface IBHPkgConfig {
  id: string,
  name: string
  img_url: string
  title: string
  update: string
  new: string
  ios_download_url: string
  android_download_url: string
  android_part_download_url: string
}

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
      message: `魔女祈愿结果\n${ _initMessage(_data) }\n搞事学园提供技术支持~`,
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
      message: `公主祈愿结果\n${ _initMessage(_data) }\n搞事学园提供技术支持~`,
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
      message: `魔法少女祈愿结果\n${ _initMessage(_data) }\n搞事学园提供技术支持~`,
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
      message: `大小姐祈愿结果\n${ _initMessage(_data) }\n搞事学园提供技术支持~`,
      group_id: data.group_id
    })
  }

  async getBenghuaiPkg(event: any, data: ICqMessageResponseGroup) {
    if (!data.group_id) return
    if (delay[data.group_id] && delay[data.group_id]['getBenghuaiPkg']) return
    let message = data.raw_message
    if (message === '下载地址' || message === '下载链接') {
      return this.sendMessage({
        message: '如需要查询国服崩坏下载地址，则再次发送：国服崩坏下载地址\n当前支持国服，测试服，B服，布卡服，布丁服\n如有疑问请联系master',
        group_id: data.group_id
      })
    }
    if (message.endsWith('崩坏下载链接') || message.endsWith('崩坏下载地址')) {
      const param = message.replace('崩坏下载链接', '').replace('崩坏下载地址', '')
      if (!param) {
        return this.sendMessage({
          message: '输入对应服务器的包，如：国服崩坏下载链接',
          group_id: data.group_id
        })
      }
      const url = 'https://www.benghuai.com/download/config'
      const res = await axios.get(url)
      if (res.status === 200 && res.data) {
        const bhPkgConfig = res.data
        const target = getBHPkg(param, bhPkgConfig)
        if (!target) {
          return this.sendMessage({
            message: '未找到对应名称的下载地址，如想新增名称，可联系master',
            group_id: data.group_id
          })
        } else {
          const ios_download_url = target.ios_download_url
          const android_download_url = target.android_download_url
          const android_part_download_url = target.android_part_download_url
          let message = `${ param }下载地址: \n`
          if (ios_download_url) {
            message += `IOS: ${ ios_download_url }\n`
          }
          if (android_download_url) {
            message += `安卓完整包: ${ android_download_url }\n`
          }
          if (android_part_download_url) {
            message += `安卓分包: ${ android_part_download_url }\n`
          }
          message += `十分钟后可再次查询`
          addDelay(data.group_id, 'getBenghuaiPkg')
          setTimeout(() => {
            deleteDelay(data.group_id, 'getBenghuaiPkg')
          }, 10 * 60 * 1000)
          return this.sendMessage({
            message,
            group_id: data.group_id
          })
        }

      }

    }

  }
}

// high是公主，custom是魔女，middle是大小姐，special是魔法少女
const getGacha = (type: 'high' | 'custom' | 'middle' | 'special' | 'festival'): Promise<{ title: string, isGod: boolean }[]> => {
  return new Promise((resolve, reject) => {
    const url = `https://api.redbean.tech/gacha/${ type }`
    request(url, (error: any, response: any, body: any) => {
      if (error) {
        Log.Error(error)
        return resolve(null)
      }
      const res: any = response.body
      if (res) {
        const arr: { title: string, isGod: boolean }[] = JSON.parse(res)
        resolve(arr)
      }
    })
  })
}

const _initMessage = (arr: { title: string, isGod: boolean }[]) => {
  let msg = arr.map(item => {
    return `${ item.isGod ? ' [稀有] ' : '' }${ item.title }`
  }).join('\n')
  return msg
}


const getBHPkg = (text: string, config: IBHPkgConfig[]): IBHPkgConfig => {
  const pkgServerName = ["gf", "Beta", "bilibili", "buka", "buding", "yy_youku", "sina/2144", "iqiyi", "amigo"]
  const map: { [key in string]: string[] } = {
    gf: ['gf', '国服'],
    Beta: ['beta', 'Beta', '测试服'],
    bilibili: ['bilibili', 'B服', 'b服'],
    buka: ['buka', '布卡服'],
    buding: ['buding', '布丁服']
  }
  let type = ''
  for (let key in map) {
    const value = map[key]
    if (value.indexOf(text) > -1) {
      type = key
      break
    }
  }
  return config.find(item => item.name === type)
}



export default Benghuai
