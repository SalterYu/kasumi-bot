import { CQWebSocketOption } from "cq-websocket";
import { cqStrToArr } from "./message";
import * as Path from 'path'
import * as rd from 'rd'
import { IConfig } from "../../typings";

function initCQWebSocketOptions(config: any): Partial<IConfig> {
  // 可以做一层拦截
  const res: Partial<IConfig> = {};
  res.accessToken = config.access_token;
  res.baseUrl = config.baseUrl;
  res.enableAPI = config.enableAPI;
  res.fragmentationThreshold = config.fragmentationThreshold;
  res.host = config.host;
  res.port = config.port;
  res.protocol = config.protocol;
  res.reconnection = config.reconnection;
  res.reconnectionAttempts = config.reconnectionAttempts;
  res.reconnectionDelay = config.reconnectionDelay;
  res.fragmentOutgoingMessages = config.fragmentOutgoingMessages;
  res.fragmentationThreshold = config.fragmentationThreshold;
  res.tlsOptions = config.tlsOptions;
  res.requestOptions = config.requestOptions;
  res.qq = config.qq;
  res.superUsers = config.superUsers.map((item: string) => +item)
  return res;
}

async function requirePlugins(path: string) {
  const _path = Path.join(__dirname, '../', path)
  let files: string[] = []
  rd.eachFileFilterSync(_path, /\.js$/, (f, s) => {
    files.push(f)
  })
  const plugins = []
  for(let file of files) {
    if (/(.js)$/.test(file)) {
      const plugin = await import(file)
      plugins.push(plugin.default)
    }
  }
  return plugins
}

const isEqualStr = (a: string, b: string) => a.trim() === b.trim()

const random = (min: number = 1, max: number = 10) => Math.floor(Math.random() * (max - min + 1) ) + min;

export { initCQWebSocketOptions, cqStrToArr, requirePlugins, isEqualStr, random };
