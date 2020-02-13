import { CQWebSocket, CQWebSocketOption } from 'cq-websocket'

import config from './config/config.json'
import Bot from './core'
import { requirePlugins } from "./utils";

const bot = new Bot(config as Partial<CQWebSocketOption>)

requirePlugins('./app').then(res => {
  bot.use(res)
})

bot.connect()
