class MessageManager {
  static at (qq: number) {
    const res = `[CQ:at,qq=${qq}]`
    return res
  }
}

export default MessageManager
