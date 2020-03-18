import BasePlugin from '../../core/basePlugin'
import { on_command, toService } from '../../decorator'
import Bot, { Permission } from '../../core'
import axios from 'axios'
import MessageManager from '../../utils/messageManager'
import { dateFtt, random } from '@utils'
import { downloadImageToBase64 } from '../../utils/image'
import { getPathsToTry } from 'tsconfig-paths/lib/try-path'
import Log from '../../utils/log'

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const schedule = require('node-schedule')

@toService('setu', {
  '1. setu': '发送 来份涩图 来份色图 色图 涩图触发功能',
})
class Setu extends BasePlugin {
  setuUserSet: Set<number>
  setuQueue: any[] = []

  constructor(bot: Bot) {
    super(bot)
    this.setuUserSet = new Set<number>()
  }

  async setu(
    event: any,
    data: ICqMessageResponseGroup | ICqMessageResponsePrivate
  ) {
    if (data.message_type === 'private') return
    const commands = ['来份涩图', '来份色图', '涩图', '色图']
    if (!this.$bot.checkCommandValid(commands, data)) return
    const userId = data.user_id
    const message = data.raw_message
    const msgMap: { [key in number]: string } = {
      1: `${ MessageManager.at(userId) }\n你冲太快了，露娜觉得你很恶心，十分钟后再冲吧！！D区`,
      2: `${ MessageManager.at(userId) }\n你....你精力也太旺盛了吧，那么能冲？？？等十分钟再来吧...`,
      3: `${ MessageManager.at(userId) }\n酝酿个十分钟再冲吧，太快了露娜会嫌弃你的！`,
      4: `${ MessageManager.at(userId) }\n喂喂喂？我都还没有感觉，你就冲了？能不能十分钟后再来？？(ー_ー)!!`
    }
    if (commands.includes(message)) {
      if (this.setuUserSet.has(userId)) {
        return this.sendMessage({
          group_id: data.group_id,
          message: msgMap[random(1, 4)],
        })
      }
      const { loliConApiKey, ageType, picNum } = this.$bot.config
      if (!loliConApiKey) {
        return this.sendMessage({
          group_id: data.group_id,
          message: '主人不让我找setu，都怪他！！',
        })
      }
      this.setuUserSet.add(userId)
      if (this.setuQueue.length === 0) {
        const res = await axios.get(
          `https://api.lolicon.app/setu/?size1200=true&&r18=${ ageType ||
          0 }&&apikey=${ loliConApiKey }&&num=${ picNum }`
        )
        if (res.data.code !== 0) {
          return this.sendMessage({
            group_id: data.group_id,
            message: res.data.msg,
          })
        }
        this.setuQueue = res.data.data
        savePictureArr(res.data.data)
      }
      setTimeout(() => {
        this.setuUserSet.delete(userId)
      }, 1000 * 60 * 5)
      const _data: any = this.setuQueue.shift()
      const msg: any = await this.sendMessage({
        group_id: data.group_id,
        // message: '色图'
        message: MessageManager.image(_data.url),
      })
      const self = this
      if (msg && msg.status === 'ok') {
        // let rule = new schedule.RecurrenceRule()
        // rule.hour = 0
        // rule.minute = 0
        // rule.second = 0
        // schedule.scheduleJob(rule, async () => {
        //   this.setuUserSet.clear()
        // })
        const messageId = msg.data.message_id
        setTimeout(() => {
          this.deleteMsg(messageId).then(msg2 => {
            if (msg2.status === 'failed') {
              self.sendMessage({
                group_id: data.group_id,
                message: `setu由于过于OOXX，没法发送，建议去pixiv查看，pid：${ _data.pid }`,
              })
            }
          })
        }, 1000 * 20)
      }
    }
  }
}

// 把 图下载到本地服务器
function savePicture(url: string, isR18 = false) {
  const _path = path.resolve(process.cwd(), './src/.koishi/setu')
  const reg = /^(.*)\/([^\/]*)$/
  reg.exec(url)
  const p = RegExp.$1 // 路径
  const n = RegExp.$2 // 文件名
  return downloadImageToBase64(url).then(res => {
    let filePath = ''
    if (!isR18) {
      filePath = path.resolve(_path, p.replace('https://i.pixiv.cat/', ''))
    } else {
      filePath = path.resolve(`${ _path }/r18`, p.replace('https://i.pixiv.cat/', ''))
    }
    if (!fs.existsSync(filePath)) {
      mkdirp.sync(filePath)
    }
    fs.writeFile(
      path.resolve(filePath, `${ n }`),
      Buffer.from(res.img64, 'base64'),
      (err: any) => {
        if (!err) {
          Log.Success('setu save success')
        }
      }
    )
  })
}

function savePictureArr(arr: any[]) {
  const prom = arr.map((item: any) => {
    return savePicture(item.url, item.r18)
  })
  Promise.all(prom)
}

export default Setu
