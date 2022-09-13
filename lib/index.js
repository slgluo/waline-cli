const path = require('path')
const { existsSync, writeFileSync, mkdirSync } = require('fs')
const { homedir } = require('os')
const commander = require('commander')
const colors = require('colors')
const { logger } = require('./utils')
const {
  initCommand,
  startCommand,
  stopCommand,
  restartCommand,
  logCommand,
  statusCommand,
  envCommand,
} = require('./commands')
const pkg = require('../package.json')
const constants = require('./const')
const { CONFIG_DIR } = require('./const')

const program = new commander.Command()

async function cli() {
  await prepare()
  registerCommand()
}

async function prepare() {
  await checkRoot()
  await checkUserHome()
  await checkEnv()
}

async function checkRoot() {
  const { default: rootCheck } = await import('root-check')
  rootCheck()
}

async function checkUserHome() {
  const { pathExistsSync } = await import('path-exists')
  const dir = homedir()
  if (!pathExistsSync(dir)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
}

async function checkEnv() {
  const dotenv = require('dotenv')
  const { pathExistsSync } = await import('path-exists')

  const configPath = path.resolve(homedir(), constants.CONFIG_DIR)
  const envFilePath = path.resolve(configPath, '.env')

  if (!existsSync(envFilePath)) {
    if (!pathExistsSync(configPath)) {
      mkdirSync(configPath, { recursive: true })
    }
    writeFileSync(envFilePath, '')
  }

  dotenv.config({
    path: envFilePath,
  })
  process.env.CONFIG_PATH = path.resolve(homedir(), CONFIG_DIR)
}

function registerCommand() {
  program
    .name(Reflect.ownKeys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)

  program
    .command('init')
    .description('初始化数据库')
    .option('-f --force', '是否覆盖配置', false)
    .action(initCommand)
  program.command('start').description('开启waline服务').action(startCommand)
  program.command('stop').description('停止waline服务').action(stopCommand)
  program.command('restart').description('重启waline服务').action(restartCommand)
  program.command('log').description('查看waline服务日志').action(logCommand)
  program.command('status').description('查看waline服务状态').action(statusCommand)
  program.command('env').description('查看环境变量').action(envCommand)

  program.on('option:debug', () => {
    const opts = program.opts()
    if (opts.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    logger.level = process.env.LOG_LEVEL
  })

  program.parse(process.argv)
}

module.exports = cli
