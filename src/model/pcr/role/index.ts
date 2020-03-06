import { downloadImageToBase64 } from "../../../utils/image";
import Log from "../../../utils/log";

const mkdirp = require('mkdirp')
const Path = require('path')
const fs = require('fs')

class PcrRole {
  _level: number // 星级
  id: number // 默认Id
  idOne: number // 1星的Id
  idThree: number // 3星的Id
  idSix: number // 六星的Id
  CNName: string // 台版的名字
  JPName: string // 日版的名字
  alias: string[] // 其他别名
  constructor(alias: string[]) {
    this._init(alias)
  }

  _init(alias: string[]) {
    // 获取id，和日文名和台服名和别名
    const [id, CNName, JPName, ..._alias] = alias
    this.id = +id
    this.CNName = CNName
    this.JPName = JPName
    this.alias = alias
  }

  setExtData(param: any) {
    Object.assign(this, param)
  }

  getId(level: number = 3) {
    if (level < 3) level = 3
    if (level >= 3 && level < 6) level = 3
    if (level === 6) level = 6
    return this.id + level * 10
  }

  getImageUrl(id: number) {
    return `http://pcr-assets.komeiji.cn/roles/${ id }.png`
  }

  loadImage(id: number) {
    return new Promise(async (resolve, reject) => {
      // 先从本地缓存找
      const _path = Path.resolve(process.cwd(), './src/.koishi/icon')
      if (!fs.existsSync(_path)) {
        // 是同步的
        mkdirp.sync(_path)
      }
      const iconPath = Path.resolve(_path, `./${ this.getId(id) }.png`)
      if (fs.existsSync(iconPath)) {
        fs.readFile(iconPath, ((err: any, data: any) => {
          if (err) {
            return resolve('')
          }
          const _data = data.toString('base64')
          return resolve({
            img64: _data,
            src64: `data:image/png;base64,${ _data }`,
          })
        }))
      } else {
        const url = this.getImageUrl(this.getId(id))
        return downloadImageToBase64(url).then(res => {
          if (res) {
            fs.writeFile(iconPath, Buffer.from(res.img64, 'base64'), (err: any) => {
              if (err) {
                Log.Error('创建图片失败，图片路径', iconPath)
              }
            })
            resolve(res)
          }
        }).catch(err => {
          Log.Error('下载失败,地址为：', url, err)
        })
      }
    })
  }
}


export default PcrRole
