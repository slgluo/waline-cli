const { BaseCommand } = require('./base-command')
const { pm2, logger } = require('../utils')

class StartCommand extends BaseCommand {
  async exec() {
    pm2.start()
    if (this.cmdObj.startup) {
      const success = pm2.setStartup()
      if (success) {
        logger.info('开机自启动设置成功')
      } else {
        logger.info('开机自启动设置失败')
      }
    }
    this.showLog()
  }

  showLog() {
    logger.info('客户端地址：http://localhost:8360')
    logger.info('管理端地址: http://localhost:8360/ui')
  }
}

module.exports = function (options) {
  new StartCommand(options)
}
