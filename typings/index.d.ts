import { CQWebSocketOption } from "cq-websocket";

declare module "*.json" {
  const value: any;
  export default value;
}

type IAnyObject = Record<string, any>

export interface IConfig extends CQWebSocketOption {
  superUsers: number[]
  loliConApiKey: string
}


declare module message {
  const value: any;
  export {}
}
