const colors = require('colors')
const { BaseCommand } = require('./base-command')
const { logger, DotenvUtils } = require('../utils')

class EnvCommand extends BaseCommand {
  exec() {
    const env = DotenvUtils.getEnv()
    const keys = Reflect.ownKeys(env)
    let info = ``
    keys.forEach((key, index) => {
      if (index === 0) {
        info = '\n'
      }
      info += `${colors.red(key)} = ${env[key]}\n`
    })
    logger.info(info)
  }
}

module.exports = function () {
  new EnvCommand()
}
