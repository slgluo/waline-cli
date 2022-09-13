const path = require('path')
const { homedir } = require('os')
const { CONFIG_DIR } = require('./const')

require('dotenv').config({ path: path.resolve(homedir(), CONFIG_DIR, '.env'), override: true })
require('@waline/vercel/vanilla.js')
