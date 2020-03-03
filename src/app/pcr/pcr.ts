import BasePlugin from '../../core/basePlugin'
import { on_command, toService } from '../../decorator'
import Bot, { Permission } from '../../core'
import MessageManager from '../../utils/messageManager'

@toService('公主连结', {
  'pcr速查': "输入 pcr速查 来查看关于公主连结的一些网站"
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
      message: `${MessageManager.at(data.user_id)}
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
}

export default Pcr
