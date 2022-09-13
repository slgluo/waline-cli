#!/usr/bin/env node

const importLocal = require('import-local')

if (importLocal(__dirname)) {
  require('npmlog').info('waline-cli', '正在使用 waline-cli 本地版')
} else {
  require('../lib')()
}
