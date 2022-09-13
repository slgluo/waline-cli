const { BaseCommand } = require('./base-command')
const { pm2 } = require('../utils')

class LogCommand extends BaseCommand {
  exec() {
    pm2.log()
  }
}

module.exports = function () {
  new LogCommand()
}
