const { BaseCommand } = require('./base-command')
const { pm2, logger } = require('../utils')

class StartCommand extends BaseCommand {
  async exec() {
    pm2.start()
    if (pm2.isRunning()) {
      logger.info('客户端地址：http://localhost:8360')
      logger.info('管理端地址: http://localhost:8360/ui')
    }
  }
}

module.exports = function () {
  new StartCommand()
}
