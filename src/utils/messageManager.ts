class MessageManager {
  static at (qq: number) {
    const res = `[CQ:at,qq=${qq}]`
    return res
  }

  static image(file: string) {
    return `[CQ:image,file=${file}]`
  }

  static image64(base64: string) {
    if (base64.startsWith('data:image/png;base64,')) {
      base64 = base64.replace('data:image/png;base64,', '')
    }
    return `[CQ:image,file=base64://${base64}]`
  }
}

export default MessageManager
