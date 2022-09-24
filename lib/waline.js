const path = require('path')
const { homedir } = require('os')
const { CONFIG_DIR } = require('./const')

const CLI_HOME_PATH = path.resolve(homedir(), CONFIG_DIR)

require('dotenv').config({ path: path.resolve(CLI_HOME_PATH, '.env'), override: true })

require(path.resolve(CLI_HOME_PATH, 'node_modules/@waline/vercel/vanilla.js'))
