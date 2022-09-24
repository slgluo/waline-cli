const path = require('path')

const CONFIG_DIR = '.waline-cli'
const DEPENDENCIES_DIR = path.join(CONFIG_DIR, 'node_modules')

module.exports = {
  CONFIG_DIR,
  DEPENDENCIES_DIR,
}
