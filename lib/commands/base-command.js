const { logger, DotenvUtils } = require('../utils')

class BaseCommand {
  constructor(args) {
    this.initCmdArgs(args)
    this.exec()
  }

  initCmdArgs(args) {
    this.cmdObj = args || {}
  }

  setEnvVars(env) {
    const originalEnv = DotenvUtils.getEnv()
    const result = Object.assign(originalEnv, env)

    DotenvUtils.update(result)

    const envFilePath = DotenvUtils.getEnvPath()
    logger.info(`已为您生成配置文件：${envFilePath}`)
  }

  exec() {
    throw new Error('exec()未重写')
  }
}

module.exports = {
  BaseCommand,
}
