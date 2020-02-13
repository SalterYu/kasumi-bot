interface ICqMessage {
  type: string,
  data: {
    [key in string]: string
  }
}

interface ICqMessageText extends ICqMessage {
  type: 'text',
  data: {
    text: string
  }
}

interface ICqMessageImage extends ICqMessage {
  type: 'image',
  data: {
    file: string,
    url: string
  }
}

interface ICqMessageFace extends ICqMessage {
  type: 'face',
  data: {
    id: string
  }
}

interface ICqMessageAt extends ICqMessage {
  type: 'at',
  data: {
    qq: string
  }
}

interface ICqMessageResponseGroup {
  anonymous: any
  font: number
  group_id: number
  message: ICqMessageRawMessageArr | string
  message_id: number
  message_type: 'group'
  post_type: string
  raw_message: string
  self_id: number
  sender: {
    age: number
    area: string
    card: string
    level: string
    nickname: string
    role: string
    sex: string
    title: string
    user_id: number
  }
  sub_type: string
  time: number
  user_id: number
}


interface ICqMessageResponsePrivate {
  font: number
  message: ICqMessageRawMessageArr | string
  message_id: number
  message_type: 'private'
  post_type: string
  raw_message: string
  self_id: number
  sender: {
    age: number
    nickname: string
    sex: string
    user_id: number
  }
  sub_type: string
  time: number
  user_id: number
}

type ICqMessageRawMessageArr = (ICqMessageText | ICqMessageImage | ICqMessageFace | ICqMessageAt)[]
