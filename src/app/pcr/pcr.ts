import BasePlugin from '../../core/basePlugin'
import { on_command, once, toService } from '../../decorator'
import Bot, { Permission } from '../../core'
import MessageManager from '../../utils/messageManager'
import { dateFtt, random } from "@utils";

const schedule = require('node-schedule');

@toService('公主连结', {
  '1.pcr速查': "输入 pcr速查 来查看关于公主连结的一些网站"
})
class Pcr extends BasePlugin {
  constructor(bot: Bot) {
    super(bot)
  }

  @on_command('pcr速查', {
    perm: Permission.GROUP,
  })
  async pcrList(
    event: any,
    data: ICqMessageResponseGroup,
    message: ICqMessageRawMessageArr
  ) {
    return this.sendMessage({
      group_id: data.group_id,
      message: `${ MessageManager.at(data.user_id) }
图书馆(繁中)：pcredivewiki.tw 
日文wiki：gamewith.jp/pricone-re
日文wiki：appmedia.jp/priconne-redive
竞技场(台日)：pcrdfans.com/battle
竞技场(日)：nomae.net/arenadb
NGA论坛：bbs.nga.cn/thread.php?fid=-10308342
日官网：priconne-redive.jp
台官网：www.princessconnect.so-net.tw`,
    })
  }

  @once
  async pcrNotice() {
    const self = this
    const msgMap: { [key in number]: string } = {
      1: `现在时间十四点四十五，露娜娜提醒骑士君该背刺啦~(〃'▽'〃)`,
      2: `啊！不好了！现在是背刺时间了，骑士君快点快点！！(..•˘_˘•..)`,
      3: `骑士君快上游戏背刺啦！~(〃'▽'〃)`
    }
    let rule = new schedule.RecurrenceRule();
    rule.hour = 14
    rule.minute = 45
    rule.second = 0
    schedule.scheduleJob(rule, async () => {
      const groups = await this.getGroupList()
      const time = dateFtt('yyyy年MM月dd日', `${ new Date() }`)
      const func = groups.data.map(group => {
        self.sendMessage({
          group_id: group.group_id,
          message: msgMap[random(1, 3)]
        })
      })
      Promise.all(func)
    })
  }
}

export default Pcr
