import { CQWebSocket, CQWebSocketOption } from "cq-websocket";
import { initCQWebSocketOptions } from "../utils";
import Log from "../utils/log";
import { IConfig } from "../../typings";
import { Permission, checkPerm, getRolePerm } from "./permission";
import Service, { checkServiceEnable } from './service'
import * as Path from 'path'

const mkdirp = require('mkdirp')

const debug = false

interface Bot extends CQWebSocketOption {
  bot: CQWebSocket;
  config: Partial<IConfig>;
  plugins: any[];
  commands: any[];
  service: Set<Service>
}

class Bot {
  constructor(props?: Partial<CQWebSocketOption>) {
    if (props) {
      this.config = initCQWebSocketOptions(props);
    }
    this.service = new Set()
  }

  connect() {
    const bot = new CQWebSocket(this.config);
    this.bot = bot;
    if (this.bot) this._init();
    bot.connect();
    this._initServerConfig()
    return bot;
  }

  _initServerConfig() {
    const path = Path.join(__dirname, '../.koishi/service-config')
    mkdirp.sync(path)
  }

  _init() {
    this.bot.on("ready", () => {
      console.log("[WebSocket] 连接成功, 开始加载插件");
      this._loadPlugins(this.plugins);
    });

    this.bot.on("message", (event, data) => {
      this.plugins.forEach((plugin) => {
        const enable = checkServiceEnable(this.service, plugin.constructor.name.toLowerCase(), data.group_id)
        if (enable) {
          const funcNames = Object.getOwnPropertyNames(
            plugin.constructor.prototype
          );
          funcNames.forEach(funcName => {
            if (funcName !== "constructor") {
              const func = plugin[funcName];
              func && func.call(plugin, event, data);
            }
          });
        }
      });
    });
  }

  use(plugins: any[]) {
    this.plugins = plugins;
  }

  _loadPlugins(plugins: any[]) {
    this.plugins = plugins.map(constructor => {
        if (constructor.isPlugin) {
          if (debug) {
            if (constructor.name.toLowerCase() === 'test' || constructor.name.toLowerCase() === 'pcrarena' || constructor.name.toLowerCase() === 'index') {
              if (constructor.isService) {
                Log.Success("已加载插件：", constructor.serverName || constructor.name);
                this.service.add(new Service(constructor))
              }
              return new constructor(this);
            }
          } else {
            Log.Success("已加载插件：", constructor.name);
            if (constructor.isService) {
              this.service.add(new Service(constructor))
            }
            // 如果不是service，则直接加载，不做记录。
            return new constructor(this);
          }
        } else {
          Log.Warning("非插件", constructor.name);
        }
      })
      .filter(item => item);
  }
}

export default Bot;

export { Permission, checkPerm, getRolePerm };
