const shell = require('shelljs')
const path = require('path')
const dotenv = require('dotenv')
const logger = require('./logger')

const APP_NAME = 'waline'

function getPm2cmdPath() {
  const pm2Path = require.resolve('pm2')
  const pm2Dir = path.dirname(pm2Path)
  return path.resolve(pm2Dir, './bin/pm2')
}

function getWalinePath() {
  return require.resolve('../waline.js')
}

/**
 * 根据字符串（类表格）解析 app 列表
 * @returns {*[]}
 */
function getPm2AppList() {
  const pm2 = getPm2cmdPath()
  const data = shell.exec(`node ${pm2} ls`, { silent: true })
  if (!data) {
    return []
  }
  let tempData = data.split('\n')
  if (tempData.length === 0) {
    return []
  }

  let formatter = appData => {
    let splitLineCode = 9474
    let splitLine = '\\u' + splitLineCode.toString(16)
    let reg = new RegExp(splitLine)
    let splitData = appData.split(reg)
    return splitData.map(data => data.trim()).filter(data => !!data)
  }

  let buildAppList = data => {
    let keys = data[0]

    let appList = []
    for (let i = 1; i < data.length; i++) {
      let app = {}
      keys.forEach((key, index) => (app[key] = data[i][index]))
      appList.push(app)
    }
    return appList
  }

  let validData = []
  for (let i = 0, length = tempData.length; i < length; i++) {
    let currentLine = tempData[i]
    if (currentLine.charCodeAt(0) === 9484) {
      continue
    } else if (currentLine.charCodeAt(0) === 9492) {
      break
    }
    if (currentLine.match(/[a-zA-Z0-9]/)) {
      validData.push(formatter(currentLine))
    }
  }
  if (validData.length === 0) {
    return []
  }

  return buildAppList(validData)
}

/**
 * 通过 app 名称获取 app
 * @param appName
 * @returns {Promise<undefined|*>}
 */
function getAppByName(appName) {
  let appList = getPm2AppList()
  if (appList.length > 0) {
    return appList.find(app => app.name === appName)
  } else {
    return undefined
  }
}

function appExists(appName) {
  return !!getAppByName(appName)
}

function isRunning() {
  const app = getAppByName(APP_NAME)
  return app && app.status === 'online'
}

function pm2Exec(command, arg) {
  const pm2 = getPm2cmdPath()
  const commandStr = arg ? `${command} ${arg}` : command
  return shell.exec(`node ${pm2} ${commandStr}`, { silent: true })
}

function start() {
  const waline = getWalinePath()
  if (!isRunning()) {
    dotenv.config({
      path: path.resolve(process.env.CONFIG_PATH, '.env'),
      override: true,
    })
    if (appExists(APP_NAME)) {
      pm2Exec('start', APP_NAME)
    } else {
      const logDir = path.resolve(process.env.CONFIG_PATH, './logs')
      const args = [
        ['--name', APP_NAME],
        ['--output', `${logDir}/waline_info.log`],
        ['--error', `${logDir}/waline_error.log`],
        ['--max-restarts', 5],
        ['--log-date-format', 'YYYY-MM-DD HH:mm'],
        ['--restart-delay', 5000],
      ]

      const argsStr = args.map(arg => `${arg[0]} ${arg[1]}`).join(' ')

      pm2Exec('start', `${waline} --name ${APP_NAME} ${argsStr}`)
    }
    if (isRunning()) {
      logger.info(`${APP_NAME}启动成功`)
    } else {
      logger.info(`${APP_NAME}启动失败`)
    }
  } else {
    logger.info(`${APP_NAME}已经在运行`)
  }
}

function save() {
  return pm2Exec('save', '--force')
}

function stop(name = APP_NAME) {
  if (isRunning()) {
    pm2Exec('stop', name)
    if (!isRunning()) {
      logger.info(`${name}已停止`)
    } else {
      logger.info(`${name}停止失败`)
    }
  } else {
    logger.info(`${name}未运行`)
  }
}

function deleteApp(name = APP_NAME) {
  return pm2Exec('delete', name)
}

function restart() {
  if (isRunning()) {
    pm2Exec('restart', APP_NAME)
    if (isRunning()) {
      logger.info(`${APP_NAME}重启成功`)
    } else {
      logger.info(`${APP_NAME}重启失败`)
    }
  } else {
    start()
  }
}

function startup() {
  return pm2Exec('startup')
}

function unstartup() {
  return pm2Exec('unstartup', 'systemd')
}

function status() {
  if (isRunning()) {
    logger.info('active')
  } else {
    logger.info('inactive')
  }
}

/**
 * 移除自启动
 * @param removeService 为 true 时，移除startup生成的service文件，为  false 时，仅删除process list中的APP_NAME应用
 */
function removeStartup(removeService = false) {
  if (removeService) {
    const result = unstartup()
    if (result.code === 1) {
      const output = result.stdout || ''
      if (
        output &&
        output.indexOf('[PM2] To unsetup the Startup Script, copy/paste the following command:') !==
          -1
      ) {
        const cmd = output.split('\n')[2]
        const res = shell.exec(cmd)
        return !!(res.code === 0 && res.stdout && res.stdout.indexOf('[PM2] Init file disabled'))
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    deleteApp()
    save()
    return true
  }
}

function setStartup() {
  if (isRunning()) {
    save()
    const result = startup()
    if (result.code === 1) {
      const output = result.stdout || ''
      if (
        output &&
        output.indexOf('[PM2] To setup the Startup Script, copy/paste the following command:') !==
          -1
      ) {
        const cmd = output.split('\n')[2]
        const res = shell.exec(cmd)
        return !!(
          res.code === 0 &&
          res.stdout &&
          res.stdout.indexOf('Command successfully executed')
        )
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    logger.warn('请启动服务再设置')
    return false
  }
}

function log() {
  if (isRunning()) {
    const pm2 = getPm2cmdPath()
    const child = shell.exec(`node ${pm2} log ${APP_NAME}`, { async: true })
    child.stdout.on('data', data => {
      console.log(data)
    })
  } else {
    logger.info(`${APP_NAME}未运行`)
  }
}

const pm2 = {
  start,
  stop,
  deleteApp,
  removeStartup,
  restart,
  setStartup,
  unstartup,
  log,
  status,
  isRunning,
}

module.exports = pm2
