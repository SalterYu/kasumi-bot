// 思路采取hoshino，见：https://github.com/Ice-Cirno/HoshinoBot/blob/f924449ecf3d1e377ad4efad6c80209a8ae16144/hoshino/service.py#L119
// 采用一个服务一个配置文件，即一个app/*.ts,一个service_config

import * as Path from 'path'

const fs = require('fs')

interface IServiceConfig {
  name: string
  enable_on_default: boolean
  enable_group: number[]
  disable_group: number[]
}

class Service {
  serverName: string
  defaultEnable: boolean
  config: IServiceConfig
  path: string
  plugin: any

  constructor(serverName: string, plugin: any, defaultEnable: boolean = true) {
    this.serverName = serverName
    this.defaultEnable = defaultEnable
    this.plugin = plugin
    this.path = Path.join(__dirname, '../.koishi/service-config', `${ serverName }.json`)
    this._init()
  }

  _init() {
    this.config = loadServiceConfig(this.serverName, this.path)
  }

  setEnableGroup(group_id: number) {
    this.config.enable_group.push(group_id)
    this.config.disable_group = this.config.disable_group.filter(item => item !== group_id)
    saveServiceConfig(this, this.path)
  }

  setDisableGroup(group_id: number) {
    this.config.disable_group.push(group_id)
    this.config.enable_group = this.config.enable_group.filter(item => item !== group_id)
    saveServiceConfig(this, this.path)
  }
}

const loadServiceConfig = (serverName: string, path: string): IServiceConfig => {
  let config: IServiceConfig = {
    name: serverName,
    enable_on_default: true,
    enable_group: [],
    disable_group: [],
  }
  if (!fs.existsSync(path)) {
    return config
  } else {
    const _config = JSON.parse(fs.readFileSync(path, 'utf8'))
    if (Object.keys(_config).length) return _config
    return config
  }
}

const saveServiceConfig = (service: Service, path: string) => {
  fs.writeFileSync(path, JSON.stringify(service.config, null, 2), 'utf8')
}

export const checkServiceEnable = (service: Set<Service>, serverName: string, group_id: number) => {
  const arr = Array.from(service)
  const _service = arr.find(item => item.serverName === serverName)
  if (_service) {
    const config = _service.config
    if (config.disable_group.length && config.disable_group.length) {
      return config.enable_group.includes(group_id)
    } else {
      return config.enable_on_default
    }
  }
  // 如果不是service服务，则返回true
  return true
}

export default Service
