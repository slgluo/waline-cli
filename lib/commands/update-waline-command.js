const path = require('path')
const npminstall = require('npminstall')
const semver = require('semver')
const inquirer = require('inquirer')
const { BaseCommand } = require('./base-command')
const { logger, NpmUtils, WalineUtils } = require('../utils')
const { homedir } = require('os')
const { CONFIG_DIR, DEPENDENCIES_DIR } = require('../const')

class UpdateWalineCommand extends BaseCommand {
  async exec() {
    const currentVersion = await WalineUtils.getLocalWalineVersion()
    if (!currentVersion) {
      logger.info('@waline/vercel 尚未安装')
      await this.installWaline()
      return
    }

    const latestVersion = await NpmUtils.getNpmLatestVersion(
      '@waline/vercel',
      NpmUtils.getDefaultRegistry()
    )
    if (semver.gte(currentVersion, latestVersion)) {
      logger.info('@waline/vercel已经是最新版本')
    } else {
      const { update } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'update',
          message: `@waline/vercel当前版本为：${currentVersion}，最新版本为：${latestVersion}，是否更新？`,
        },
      ])
      if (update) {
        await this.updateWaline()
      }
    }
  }

  async installWaline(version = 'latest') {
    logger.info('正在安装@waline/vercel...')

    await npminstall({
      root: homedir(),
      targetDir: path.resolve(homedir(), CONFIG_DIR),
      storeDir: path.resolve(homedir(), DEPENDENCIES_DIR),
      registry: NpmUtils.getDefaultRegistry(),
      pkgs: [
        {
          name: '@waline/vercel',
          version: version,
        },
      ],
    })

    logger.success('@waline/vercel安装成功')
  }

  async updateWaline(version = 'latest') {
    logger.info('正在更新@waline/vercel...')

    await npminstall({
      root: homedir(),
      targetDir: path.resolve(homedir(), CONFIG_DIR),
      storeDir: path.resolve(homedir(), DEPENDENCIES_DIR),
      registry: NpmUtils.getDefaultRegistry(),
      pkgs: [
        {
          name: '@waline/vercel',
          version: version,
        },
      ],
    })

    logger.success('@waline/vercel更新成功')
  }
}

module.exports = function (args) {
  new UpdateWalineCommand(args)
}
