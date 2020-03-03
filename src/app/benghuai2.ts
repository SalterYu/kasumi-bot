import BasePlugin from "../core/basePlugin";
import Bot, { Permission } from '../core'
import { on_command, toService } from "../decorator";
import Log from "../utils/log";
import { addDelay, delay, deleteDelay, random } from "../utils";
import axios from "axios";
import MessageManager from "../utils/messageManager";

const request = require('request')

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

@toService('崩坏学园2', {
  '装备查询': "输入 装备查询 XXX 来查找对应装备",
  '公主十连': '',
  '魔女十连': '',
  '魔法少女十连': '',
  '大小姐十连': '',
  '以上功能冷却时间3分钟': ''
})
class Benghuai extends BasePlugin {
  equipSearchSet: Set<number>
  customGachaSet: Set<number>
  highGachaSet: Set<number>
  specialGachaSet: Set<number>
  middleGachaSet: Set<number>

  constructor(bot: Bot) {
    super(bot)
    this.customGachaSet = new Set<number>()
    this.highGachaSet = new Set<number>()
    this.middleGachaSet = new Set<number>()
    this.specialGachaSet = new Set<number>()
    this.equipSearchSet = new Set<number>()
  }

  @on_command('装备查询', {
    vague: true,
    perm: Permission.GROUP
  })
  async equipSearch(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    // if (delay[data.group_id] && delay[data.group_id]['装备查询']) return
    const userId = data.user_id
    if (this.equipSearchSet.has(userId)) {
      return this.sendMessage({
        group_id: data.group_id,
        message: "三分钟之后再来吧，不然本萝莉会嫌弃你的！(x"
      })
    }
    if (message[0].type === 'text') {
      const param = message[0].data.text
      const group_id = data.group_id
      const url = `https://api.redbean.tech/illustrate/title/${ encodeURIComponent(param) }`
      const res = await axios({
        url,
        method: "get"
      })
      const _data = res.data
      if (_data.length) {
        let initMsg = (obj: { title: string, type: string, maxLvDesc: string }, obj1: { title: string, type: string, maxLvDesc: string }) => {
          let msg = ''
          msg += `${ obj.type }: ${ obj.title }\n`
          msg += `5★描述: ${ obj.maxLvDesc.substring(9) }\n`
          msg += `6★描述: ${ obj1.maxLvDesc.substring(9) }`
          return msg
        }
        let message = ''
        const flagData = _data[0]
        if (flagData.hasOwnProperty('ultraSkill')) {
          // 表示使魔
          const fiveStars = _data[0]
          const sixStars = _data[1]
          if (fiveStars) {
            const { title, rarity } = fiveStars
            message += `${ title }\n`;
            message += ['ultraSkill', 'hiddenUltraSkill', 'normalSkill1', 'normalSkill2']
              .map(item => `${ initMsg(fiveStars[item], sixStars[item]) }\n`).join('\n')

          }
        }
        if (flagData.hasOwnProperty('decomposeEquip')) {
          // 表示普通装备
          const fiveStars = _data[0]
          const sixStars = _data[1]
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
        }
        if (message) {
          message += `搞事学园提供沙雕技术支持~\n\n5 分钟后可以再次查询`
          this.equipSearchSet.add(userId)
          setTimeout(() => {
            this.equipSearchSet.delete(userId)
          }, 60 * 1000 * 3)
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
    }
  }

  @on_command('魔女十连', {
    perm: Permission.GROUP
  })
  async customGacha(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const userId = data.user_id
    if (this.customGachaSet.has(userId)) {
      return this.sendMessage({
        group_id: data.group_id,
        message: "三分钟之后再来吧，不然本萝莉会嫌弃你的！(x"
      })
    }
    // await this.setGroupBan(data.group_id, data.user_id, random(1, 10) * 60)
    const _data = await getGacha('custom')
    if (!_data) return
    this.customGachaSet.add(userId)
    setTimeout(() => {
      this.customGachaSet.delete(userId)
    }, 1000 * 60 * 3)
    return this.sendMessage({
      message: `${ MessageManager.at(data.user_id) }\r\n魔女祈愿结果\r\n${ _initMessage(_data) }\r\n搞事学园提供技术支持~`,
      group_id: data.group_id
    })
  }

  @on_command('公主十连', {
    perm: Permission.GROUP
  })
  async highGacha(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    const userId = data.user_id
    if (this.highGachaSet.has(userId)) {
      return this.sendMessage({
        group_id: data.group_id,
        message: "三分钟之后再来吧，不然本萝莉会嫌弃你的！(x"
      })
    }
    // await this.setGroupBan(data.group_id, data.user_id, random(1, 10) * 60)
    const _data = await getGacha('high')
    if (!_data) return
    this.highGachaSet.add(userId)
    setTimeout(() => {
      this.highGachaSet.delete(userId)
    }, 1000 * 60 * 3)
    return this.sendMessage({
      message: `${ MessageManager.at(data.user_id) }\r\n公主祈愿结果：\r\n${ _initMessage(_data) }\r\n搞事学园提供技术支持~`,
      group_id: data.group_id
    })
  }

  @on_command('魔法少女十连', {
    perm: Permission.GROUP
  })
  async specialGacha(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    // await this.setGroupBan(data.group_id, data.user_id, random(1, 10) * 60)
    const userId = data.user_id
    if (this.specialGachaSet.has(userId)) {
      return this.sendMessage({
        group_id: data.group_id,
        message: "三分钟之后再来吧，不然本萝莉会嫌弃你的！(x"
      })
    }
    const _data = await getGacha('special')
    if (!_data) {
      let msgMap: {[key in number]: string} = {
        1: '魔……魔法少女什么的……不……不存在啦！嘤嘤嘤(╥╯^╰╥)',
        2: '本萝莉根本找不到叫魔法少女的池子，给本萝莉爬！！！',
        3: '魔法少女？！那种东西我怎么可能知道啊！',
        4: '你...你把我弄坏了┭┮﹏┭┮，我找不到魔法少女在哪'
      }
      return this.sendMessage({
        message: msgMap[random(1, 4)],
        group_id: data.group_id
      })
    }
    this.specialGachaSet.add(userId)
    setTimeout(() => {
      this.specialGachaSet.delete(userId)
    }, 1000 * 60 * 3)
    return this.sendMessage({
      message: `${ MessageManager.at(data.user_id) }\r\n魔法少女祈愿结果：\n${ _initMessage(_data) }\r\n搞事学园提供技术支持~`,
      group_id: data.group_id
    })
  }

  @on_command('大小姐十连', {
    perm: Permission.GROUP
  })
  async middleGacha(event: any, data: ICqMessageResponseGroup, message: ICqMessageRawMessageArr) {
    // await this.setGroupBan(data.group_id, data.user_id, random(1, 10) * 60)
    const userId = data.user_id
    if (this.middleGachaSet.has(userId)) {
      return this.sendMessage({
        group_id: data.group_id,
        message: "三分钟之后再来吧，不然本萝莉会嫌弃你的！(x"
      })
    }
    const _data = await getGacha('middle')
    if (!_data) return
    this.middleGachaSet.add(userId)
    setTimeout(() => {
      this.middleGachaSet.delete(userId)
    }, 1000 * 60 * 3)
    return this.sendMessage({
      message: `${ MessageManager.at(data.user_id) }\r\n大小姐祈愿结果：\r\n${ _initMessage(_data) }\r\n搞事学园提供技术支持~`,
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
const getGacha = (type: 'high' | 'custom' | 'middle' | 'special' | 'festival'): Promise<{ title: string, isGod: boolean }[] | ''> => {
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
      } else {
        resolve('')
      }
    })
  })
}

const _initMessage = (arr: { title: string, isGod: boolean }[]) => {
  let msg = arr.map(item => {
    return `${ item.isGod ? `⭐️` : '     ' }${ item.title }`
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
