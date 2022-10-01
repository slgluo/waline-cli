const initCommand = require('./init-command')
const startCommand = require('./start-command')
const stopCommand = require('./stop-command')
const restartCommand = require('./restart-command')
const logCommand = require('./log-command')
const statusCommand = require('./status-command')
const envCommand = require('./env-command')
const updateWalineCommand = require('./update-waline-command')
const { startupSetCommand, startupRemoveCommand } = require('./startup-command')

module.exports = {
  initCommand,
  startCommand,
  stopCommand,
  restartCommand,
  logCommand,
  statusCommand,
  envCommand,
  updateWalineCommand,
  startupSetCommand,
  startupRemoveCommand,
}
