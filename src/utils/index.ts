import { cqStrToArr } from './message'
import * as Path from 'path'
import * as rd from 'rd'
import { IConfig } from '../../typings'
import Log from "./log";

const delay: { [group_id in string]: { [func in string]: boolean } } = {}

function initCQWebSocketOptions(config: any): Partial<IConfig> {
  // 可以做一层拦截
  const res: Partial<IConfig> = {}
  res.accessToken = config.access_token
  res.baseUrl = config.baseUrl
  res.enableAPI = config.enableAPI
  res.fragmentationThreshold = config.fragmentationThreshold
  res.host = config.host
  res.port = config.port
  res.protocol = config.protocol
  res.reconnection = config.reconnection
  res.reconnectionAttempts = config.reconnectionAttempts
  res.reconnectionDelay = config.reconnectionDelay
  res.fragmentOutgoingMessages = config.fragmentOutgoingMessages
  res.fragmentationThreshold = config.fragmentationThreshold
  res.tlsOptions = config.tlsOptions
  res.requestOptions = config.requestOptions
  res.qq = config.qq
  res.superUsers = config.superUsers.map((item: string) => +item)
  return res
}

async function requirePlugins(path: string) {
  const _path = Path.join(__dirname, '../', path)
  let files: string[] = []
  const reg = /\.(js|ts)$/
  rd.eachFileFilterSync(_path, reg, (f, s) => {
    files.push(f)
  })
  const plugins = []
  for (let file of files) {
    if (reg.test(file)) {
      const plugin = await import(file)
      plugins.push(plugin.default)
    }
  }
  if (plugins.length === 0) {
    Log.Info('没有加载的插件，直接启动')
  }
  return plugins
}

const isEqualStr = (a: string, b: string) => a.trim() === b.trim()

const random = (min: number = 1, max: number = 10): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

const addDelay = (group_id: number, funcName: string) => {
  if (!delay[group_id]) delay[group_id] = { [funcName]: true }
  else delay[group_id][funcName] = true
}

const deleteDelay = (group_id: number, funcName: string) => {
  delay[group_id][funcName] = false
}

export {
  initCQWebSocketOptions,
  cqStrToArr,
  requirePlugins,
  isEqualStr,
  random,
  addDelay,
  deleteDelay,
  delay
}
