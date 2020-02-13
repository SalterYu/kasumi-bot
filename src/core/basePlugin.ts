import CQWebSocket from "cq-websocket";
import { plugify } from "../decorator";
import Log from "../utils/log";
import Bot from "./index";

function ext(text: string) {
  return function (target: any, name: any, descriptor: any) {
    const oldValue = descriptor.value
    descriptor.value = function () {
      return new Promise((resolve, reject) => {
        return oldValue.apply(this, arguments).then((res: any) => {
          if (res.retcode == 0) {
            Log.Info(`${text}成功`, res);
            resolve(res)
            return
          }
          Log.Error(`${text}失败`, res);
          resolve(res);
        }).catch((err: any) => {
          Log.Error(`${text}失败`, err);
          reject(err);
        });
      })
    }
  }
}

@plugify
class BasePlugin {
  bot: CQWebSocket;
  $bot: Bot
  constructor(bot: Bot) {
    this.bot = bot.bot;
    this.$bot = bot
  }

  /**
   * 发送群组消息
   * @param message
   * @param group_id 群QQ
   */
  @ext('发送群组消息')
  sendMsgGroup(message: string, group_id: number) {
    return this.bot("send_group_msg", {
      group_id,
      message
    })
  }

  /**
   * 发送私聊消息
   * @param message
   * @param user_id
   */
  @ext('发送私聊消息')
  sendPrivateMsg(message: string, user_id: number) {
    return this.bot("send_private_msg", {
      user_id,
      message
    })
  }

  /**
   * 发送讨论组消息
   * @param message
   * @param discuss_id
   */
  @ext('发送讨论组消息')
  sendDiscussMsg(message: string, discuss_id: number) {
    return this.bot("send_private_msg", {
      discuss_id,
      message
    })
  }

  /**
   * 通用发送消息
   * @param message
   * @param user_id
   * @param group_id
   * @param discuss_id
   * @param message_type
   */
  @ext('发送消息')
  sendMessage({
    message,
    user_id,
    group_id,
    discuss_id,
    message_type
  }: {
    message: string,
    user_id?: number,
    group_id?:number,
    discuss_id?:number,
    message_type?: 'private'| 'group' | 'discuss'
  }) {
    return this.bot("send_msg", {
      message,
      user_id,
      group_id,
      discuss_id,
      message_type
    })
    // return new Promise((resolve, reject) => {
    //
    // });
  }

  @ext('设置群组禁言')
  setGroupBan(group_id: number, user_id: number, duration: number = 30 * 60) {
    return this.bot('set_group_ban', {
      group_id,
      user_id,
      duration
    })
  }

  @ext('设置管理员')
  setGroupAdmin(group_id: number, user_id:number, enable: boolean) {
    return this.bot('set_group_admin', {
      group_id,
      user_id,
      enable
    })
  }

  @ext('撤回消息')
  deleteMsg(message_id: number) {
    return this.bot('delete_msg', {
      message_id
    })
  }
}

export default BasePlugin;
