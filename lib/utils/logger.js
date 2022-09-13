'use strict'

const logger = require('npmlog')

logger.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info' // 判断debug模式

logger.heading = 'waline' // 修改前缀
logger.addLevel('success', 2000, { fg: 'green', bold: true }) // 添加自定义命令

module.exports = logger
