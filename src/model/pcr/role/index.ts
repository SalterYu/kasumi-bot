

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

  getImageUrl(level: number = 3) {
    if (level < 3) level = 3
    if (level >= 3 && level < 6) level = 3
    if (level === 6) level = 6
    const _id = this.id + level * 10
    return `http://pcr-assets.komeiji.cn/roles/${_id}.png`
  }

}

export default PcrRole
