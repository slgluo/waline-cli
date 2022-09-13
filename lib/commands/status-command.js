const { BaseCommand } = require('./base-command')
const { pm2 } = require('../utils')

class StatusCommand extends BaseCommand {
  exec() {
    pm2.status()
  }
}

module.exports = function () {
  new StatusCommand()
}
