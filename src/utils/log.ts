import chalk from 'chalk'
import json5 from 'json5'

const log = console.log

class Log {
  static Info(...args: any[]) {
    log(chalk.cyan.apply(chalk, initMsg(args)))
  }

  static Error(...args: any[]) {
    log(chalk.red.apply(chalk, initMsg(args)))
  }

  static Warning(...args: any[]){
    log(chalk.yellow.apply(chalk, initMsg(args)))
  }

  static Success(...args: any[]) {
    log(chalk.greenBright.apply(chalk, initMsg(args)))
  }
}

function initMsg(args: any[]) {
  return args.map(item => {
    if (typeof item === 'string') {
      return item
    }
    return json5.stringify(item)
  })
}

export default Log
