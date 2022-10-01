const { BaseCommand } = require('./base-command')
const { pm2, logger } = require('../utils')

class StartupSetCommand extends BaseCommand {
  async exec() {
    const success = pm2.setStartup()
    if (success) {
      logger.info('开机自启动设置成功')
    } else {
      logger.info('开机自启动设置失败')
    }
  }
}

class StartupRemoveCommand extends BaseCommand {
  async exec() {
    const success = pm2.removeStartup(this.cmdObj.removeService)
    if (success) {
      logger.info('开机自启动移除成功')
    } else {
      logger.info('开机自启动移除失败')
    }
  }
}

module.exports = {
  startupSetCommand: function () {
    new StartupSetCommand()
  },
  startupRemoveCommand: function (options) {
    new StartupRemoveCommand(options)
  },
}
