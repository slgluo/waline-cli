const { BaseCommand } = require('./base-command')
const { pm2 } = require('../utils')

class StopCommand extends BaseCommand {
  exec() {
    pm2.stop()
  }
}

module.exports = function () {
  new StopCommand()
}
