import { cqStrToArr, isEqualStr } from '../utils';
import { checkPerm, Permission } from '../core/';
import { toTrim } from '../utils/message';
import Log from '../utils/log';
import { IAnyObject } from '../../typings';

interface ICommandOptions {
  perm?: Permission;
  vague?: boolean; // 是否开启模糊匹配，表示正则表达式匹配，开启后需要中间加一个空格，例如：指令 值，todo：暂不支持含特殊字符的模糊匹配
}

function on_command(command: string, options: ICommandOptions = {}) {
  return function(target: any, name: any, descriptor: any) {
    const oldValue = descriptor.value;
    oldValue.isCommand = true;
    oldValue.command = command;
    descriptor.value = function(
      event: any,
      data: ICqMessageResponseGroup | ICqMessageResponsePrivate
    ) {
      try {
        let message = data.message;
        if (typeof data.message === 'string') {
          message = cqStrToArr(data.message).message;
        } else {
          message = toTrim(data.message);
        }
        if (data.message_type === 'private') {
          if (checkPerm(this.$bot, data, options.perm)) {
            if (message[0].type === 'text') {
              // 表示command
              const text = message[0].data.text;
              if (text == command) {
                if (typeof text === 'string') {
                  oldValue.apply(this, [event, data, message]);
                  return Log.Info(`调用${name}成功`, data);
                }
              }
            }
          }
        }

        if (data.message_type === 'group') {
          if (message[0].type === 'text') {
            // 表示command
            const text = message[0].data.text;
            if (command === '*') {
              if (checkPerm(this.$bot, data, options.perm)) {
                oldValue.apply(this, [event, data, message]);
              }
            } else if (!options.vague) {
              if (text == command) {
                if (typeof text === 'string') {
                  if (checkPerm(this.$bot, data, options.perm)) {
                    oldValue.apply(this, [event, data, message]);
                    return Log.Info(`调用${name}成功`, data);
                  }
                }
              }
            } else if (options.vague) {
              const reg = new RegExp(`^${command}(?=\\s)`);
              if (reg.test(text)) {
                // 文本匹配成功
                // 把匹配到的指令去掉
                if (checkPerm(this.$bot, data, options.perm)) {
                  const _message = JSON.parse(JSON.stringify(message));
                  _message[0].data.text = text.replace(reg, '').trim();
                  oldValue.apply(this, [event, data, _message]);
                  return Log.Info(`调用${name}成功`, data);
                }
              } else if (command == text) {
                if (checkPerm(this.$bot, data, options.perm)) {
                  const _message = JSON.parse(JSON.stringify(message));
                  oldValue.apply(this, [event, data, _message.slice(1)]);
                  return Log.Info(`调用${name}成功`, data);
                }
              }
            }
          }
          if (message[0].type === 'image') {
            if (command === '*') {
              if (checkPerm(this.$bot, data, options.perm)) {
                oldValue.apply(this, [event, data, message]);
              }
            }
          }
          if (
            message[0].type === 'at' &&
            message[0].data.qq == this.$bot.config.qq &&
            message.length > 1
          ) {
            // 表示是艾特
            // 第二个数组的内容为command
            if (message[1].type === 'text') {
              const text = message[1].data.text;
              if (isEqualStr(text, command) || command === '*') {
                if (typeof text === 'string') {
                  oldValue.apply(this, [
                    event,
                    data,
                    message.slice(1, message.length),
                  ]);
                  return Log.Info(`调用${name}成功`, data);
                }
              }
            }
          }
        }
      } catch (e) {
        Log.Info(`调用${name}失败`, data);
      }
    };
    return descriptor;
  };
}

function once(target: any, name: any, descriptor: any) {
  const oldValue = descriptor.value
  oldValue.isOnce = true
}

function plugify(target: any) {
  target.isPlugin = true;
}

// 表示这个类作为一个服务, 进行统一管理
function toService(serverName?: string, actionIssue?: IAnyObject) {
  return (target: any) => {
    target.isService = true;
    target.serverName = serverName;
    target.actionIssue = actionIssue;
    return target;
  };
}

export { plugify, on_command, toService, once };
