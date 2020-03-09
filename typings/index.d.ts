import { CQWebSocketOption } from "cq-websocket";

declare module "*.json" {
  const value: any;
  export default value;
}

type IAnyObject = Record<string, any>

export interface IConfig extends CQWebSocketOption {
  superUsers: number[]
  loliConApiKey: string
  ageType: 0 | 1 | 2
}


declare module message {
  const value: any;
  export {}
}
