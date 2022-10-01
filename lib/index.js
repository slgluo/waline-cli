const path = require('path')
const { existsSync, writeFileSync, mkdirSync } = require('fs')
const { homedir } = require('os')
const commander = require('commander')
const colors = require('colors')
const { logger, WalineUtils } = require('./utils')
const {
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

function makeVercelCommand() {
  const vercel = new commander.Command('vercel')
  vercel
    .description('@waline/vercel相关命令')
    .usage('[command] [options]')
    .addHelpCommand('help [command]', '显示命令帮助信息')
    .helpOption('-h, --help', '显示命令帮助信息')
    .option('-V', '查看@waline/vercel当前版本')
    .action(async () => {
      const walineVersion = await WalineUtils.getLocalWalineVersion()
      logger.info(`@waline/vercel@${walineVersion}`)
    })

  vercel.command('update').description('升级@waline/vercel至最新版本').action(updateWalineCommand)

  return vercel
}

function registerCommand() {
  program
    .name(Reflect.ownKeys(pkg.bin)[0])
    .description('cli for waline independent deployment')
    .usage('<command> [options]')
    .version(pkg.version, '-v, --version', '显示cli当前版本')
    .addHelpCommand('help [command]', '显示命令帮助信息')
    .helpOption('-h, --help', '显示命令帮助信息')
    .option('-d, --debug', '是否开启调试模式', false)

  program
    .command('init')
    .description('初始化数据库')
    .option('-f --force', '是否覆盖配置', false)
    .action(initCommand)
  program
    .command('start')
    .description('开启waline服务')
    .option('--startup', '开机自动重启(不支持windows)')
    .action(startCommand)
  program
    .command('startup')
    .description('设置开机自动启动(不支持windows)')
    .action(startupSetCommand)
  program
    .command('unstartup')
    .description('移除开机自动启动')
    .option('--remove-service', '移除自启动的pm2 service服务')
    .action(startupRemoveCommand)
  program.command('stop').description('停止waline服务').action(stopCommand)
  program.command('restart').description('重启waline服务').action(restartCommand)
  program.command('log').description('查看waline服务日志').action(logCommand)
  program.command('status').description('查看waline服务状态').action(statusCommand)
  program.command('env').description('查看环境变量').action(envCommand)
  program.addCommand(makeVercelCommand())

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
