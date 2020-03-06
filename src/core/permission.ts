// see https://github.com/richardchien/nonebot/blob/master/nonebot/permission.py

import Bot from "./index";
import { APIResponse } from "cq-websocket";

export enum Permission {
  PRIVATE_FRIEND = 0x0001,  // ==> 0b0001
  PRIVATE_GROUP = 0x0002,
  PRIVATE_DISCUSS = 0x0004,
  PRIVATE_OTHER = 0x0008,
  PRIVATE = 0x000F,
  DISCUSS = 0x00F0,
  GROUP_MEMBER = 0x0100,
  GROUP_ADMIN = 0x0200,
  GROUP_OWNER = 0x0400,
  GROUP = 0x0F00,
  SUPERUSER = 0xF000,
  EVERYBODY = 0xFFFF,
  IS_NOBODY = 0x0000,
  IS_PRIVATE_FRIEND = PRIVATE_FRIEND,
  IS_PRIVATE_GROUP = PRIVATE_GROUP,
  IS_PRIVATE_DISCUSS = PRIVATE_DISCUSS,
  IS_PRIVATE_OTHER = PRIVATE_OTHER,
  IS_PRIVATE = PRIVATE,
  IS_DISCUSS = DISCUSS,
  IS_GROUP_MEMBER = GROUP_MEMBER,
  IS_GROUP_ADMIN = GROUP_MEMBER | GROUP_ADMIN,
  IS_GROUP_OWNER = GROUP_ADMIN | GROUP_OWNER,
  IS_GROUP = GROUP,
  IS_SUPERUSER = 0xFFFF,
}

export function getRolePerm(bot: Bot, ctx: ICqMessageResponseGroup | ICqMessageResponsePrivate) {
  let permission = 0
  if (ctx.message_type === 'group') {
    permission = permission | Permission.IS_GROUP_MEMBER
    if (!ctx.anonymous) {
      // 非匿名
      const memberInfo = ctx.sender
      if (memberInfo) {
        if (memberInfo.role === 'owner') permission = permission | Permission.IS_GROUP_OWNER
        if (memberInfo.role === 'admin') permission = permission | Permission.IS_GROUP_ADMIN
      }
    }
  }
  return permission
}

export function checkPerm(bot: Bot, ctx: ICqMessageResponseGroup | ICqMessageResponsePrivate, permission_required: Permission) {
  let permission = 0
  if (bot.config.superUsers.includes(ctx.user_id)) {
    permission = Permission.IS_SUPERUSER
  }
  if (ctx.message_type === 'group') {
    permission = permission | Permission.IS_GROUP_MEMBER
    if (!ctx.anonymous) {
      // 非匿名
      const memberInfo = ctx.sender
      if (memberInfo) {
        if (memberInfo.role === 'owner') permission = permission | Permission.IS_GROUP_OWNER
        if (memberInfo.role === 'admin') permission = permission | Permission.IS_GROUP_ADMIN
      }
    }
  }
  const hasPerm = Boolean(permission_required & permission)
  if (!hasPerm && ctx.message_type === 'group') {
    bot.bot('send_group_msg', {
      // message: `权限不足, 您的是${Permission[permission]}, 需要${Permission[permission_required]}`,
      message: "就凭你还想让本萝莉对你唯命是从？？？做我的朋友吧 (x",
      group_id: ctx.group_id
    })
  }
  return hasPerm
}
