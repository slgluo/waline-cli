const { homedir } = require('os')
const npminstall = require('npminstall')
const colors = require('colors')
const { CONFIG_DIR, DEPENDENCIES_DIR } = require('./const')
const path = require('path')
const { getDefaultRegistry } = require('./utils/npm-info-utils')

async function checkUserHome() {
  const { pathExistsSync } = await import('path-exists')
  const dir = homedir()
  if (!pathExistsSync(dir)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
}

;(async function () {
  await checkUserHome()

  await npminstall({
    root: homedir(),
    targetDir: path.resolve(homedir(), CONFIG_DIR),
    storeDir: path.resolve(homedir(), DEPENDENCIES_DIR),
    registry: getDefaultRegistry(),
    pkgs: [
      {
        name: '@waline/vercel',
        version: 'latest',
      },
    ],
  })
})()
