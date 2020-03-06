import BasePlugin from '../../../core/basePlugin'
import Bot, { Permission } from '../../../core'
import { on_command, toService } from '../../../decorator'
import MessageManager from '../../../utils/messageManager'
import PcrRole from '../../../model/pcr/role'
import pcrRoles from '../../../model/pcr/allRoles'
import { Canvas, Image } from 'canvas'
import { downloadImageToBase64 } from '../../../utils/image'
import mergeImages from '../../../modules/merge-images/index.es2015'
import { random } from "../../../utils";

// @ts-ignore
Canvas.Image = Image
const fs = require('fs')

const FormData = require('form-data')

interface IPcrBattleResponse {
  id: number
  userid: number
  note: string
  updated: string
  atk: string
  def: string
  equip: string
  good: number
  bad: number
  eval: number
}

@toService('公主连结竞技场', {
   '1. jjc查询': '发送jjc查询 用空格分开。例如：jjc搜索 XX XX XX XX XX 来搜索jjc结果'
})
export default class PcrArena extends BasePlugin {
  constructor(bot: Bot) {
    super(bot)
  }

  @on_command('jjc查询', {
    perm: Permission.GROUP,
    vague: true,
  })
  async getBattle(
    event: any,
    data: ICqMessageResponseGroup,
    message: ICqMessageRawMessageArr
  ) {
    this.setGroupBan(data.group_id, data.user_id, 1 * 60)
    let msg = ''
    if (!message.length) {
      return this.sendMessage({
        group_id: data.group_id,
        message: '请输入角色, 用空格分开。例如：jjc搜索 XX XX XX XX XX',
      })
    }
    if (message[0].type === 'text') {
      msg = message[0].data.text
    }
    if (!msg)
      return this.sendMessage({
        group_id: data.group_id,
        message: '请输入角色',
      })
    const params = msg.split(' ').filter(item => item.trim())
    for (let item of params) {
      const role = pcrRoles.searchRoleByAlia(item)
      if (!role) {
        return this.sendMessage({
          group_id: data.group_id,
          message: `没找到名为：【${item}】的角色，请联系master增加`,
        })
      }
    }
    const defs = params.map(item => pcrRoles.searchRoleByAlia(item))
    const keys = defs.map(item => item.JPName)
    if (keys.length <= 3) {
      return this.sendMessage({
        group_id: data.group_id,
        message: '人数不能小于4',
      })
    }
    if (keys.length > 5) {
      return this.sendMessage({
        group_id: data.group_id,
        message: '人数不能多于5',
      })
    }
    const atks: Array<{
      roles: PcrRole[]
      good: number
      bad: number
      time: string
    }> = []
    pcrRoles
      .getBattleResult(keys)
      .then(async res => {
        const _data: IPcrBattleResponse[] = res.data
        for (let item of _data) {
          let temp: {
            roles: PcrRole[]
            good: number
            bad: number
            time: string
          } = {
            roles: [],
            good: 0,
            bad: 0,
            time: '',
          }
          const atk = item.atk.split('/').filter(item => item)
          for (let role of atk) {
            const [_role, level] = role.split(',')
            const __role = pcrRoles.searchRoleByAlia(_role)
            temp.bad = item.bad
            temp.good = item.good
            temp.time = item.updated
            __role.setExtData({
              _level: level,
            })
            temp.roles.push(__role)
          }
          atks.push(temp)
        }
        const initMessage = async (
          atks: Array<{
            roles: PcrRole[]
            good: number
            bad: number
            time: string
          }> = []
        ) => {
          let message = ''
          let total = ''
          const canSendImage = await this.canSendImage()
          if (canSendImage.data.yes) {
            let loadImgsPromise: Array<Array<Promise<any>>> = []
            for (let item of atks) {
              let temp: any[] = []
              for (let role of item.roles) {
                temp.push(downloadImageToBase64(role.getImageUrl(role._level)))
              }
              loadImgsPromise.push(temp)
              // loadImgsPromise = item.roles.map((role: any) => downloadImageToBase64(role.getImageUrl(role._level)) )
              total += `👍 ${item.good}  👎 ${item.bad}\n`
            }
            let images: any[] = []
            for (let pro of loadImgsPromise) {
              images.push(await Promise.all(pro))
            }
            const b64 = await composeImage(images)
            fs.writeFileSync('./image', MessageManager.image64(b64))
            message = `${MessageManager.image64(b64)}\n`
          } else {
            for (let item of atks) {
              message += `${item.roles.map(role => role.CNName).join(`  `)}\n`
              total += `👍 ${item.good}  👎 ${item.bad}\n`
            }
          }
          return { message, total }
        }
        if (!atks.length) {
          return this.sendMessage({
            message: '没有找到进攻方案，但不代表不能解。不要打我嘤嘤嘤(╥╯^╰╥)',
            group_id: data.group_id
          })
        }
        let _atks = atks.slice(0, 6)
        const sendMsg = await initMessage(_atks)
        let defMsg = `【${defs.map(item => item.CNName).join(' ')}】\n`
        this.sendMessage({
          group_id: data.group_id,
          message: `${defMsg}已为${MessageManager.at(data.user_id)}找到已下${
            _atks.length
          }种进攻解法         \n\r${sendMsg.message}${
            sendMsg.total
          }\nSupport by nomae.net`,
        })
      })
      .catch(err => {
        console.log('err', err)
        // fs.writeFileSync('./res.json', JSON.stringify(err), 'utf8')
        this.setGroupBan(data.group_id, data.user_id, 0)
        this.sendMessage({
          group_id: data.group_id,
          message: '网路异常，请重试',
        })
      })
  }
}

function composeImage(arr: Array<Array<{ src64: string; img64: string }>>) {
  const imageWidth = 200
  const imageHeight = 200
  const length = Math.min(arr.length, 6)
  const canvasHeight = imageHeight * length
  const canvasWidth = imageWidth * 5
  const options: any = arr.slice(0, 6).map((itemA, indexA) => {
    return itemA.map((itemB, indexB) => {
      return {
        src: itemB.src64 || '',
        width: imageWidth,
        height: imageHeight,
        x: indexB * imageWidth,
        y: indexA * imageHeight,
      }
    })
  })
  return mergeImages(options.flat(), {
    Canvas: Canvas,
    width: canvasWidth,
    height: canvasHeight,
  })
}
