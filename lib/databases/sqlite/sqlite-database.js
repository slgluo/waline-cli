const path = require('path')
const { mkdirSync, existsSync } = require('fs')
const shell = require('shelljs')
const inquirer = require('inquirer')
const colors = require('colors')
const { logger } = require('../../utils')
const { Database } = require('../database')

class SqliteDatabase extends Database {
  async init() {
    await this.prepare()
  }

  async prepare() {
    const { pathExistsSync } = await import('path-exists')

    const { SQLITE_PATH, SQLITE_DB } = process.env

    const srcWalineDBName = 'waline'
    const walineDBName = SQLITE_DB || srcWalineDBName

    const srcFile = path.resolve(__dirname, `${srcWalineDBName}.sqlite`)
    const targetFile = path.resolve(SQLITE_PATH, `${walineDBName}.sqlite`)
    const dest = path.dirname(targetFile)

    // 如果文件不存在
    if (!existsSync(targetFile)) {
      if (!pathExistsSync(dest)) {
        mkdirSync(dest, { recursive: true })
      }
      this.copyAndRename(srcFile, dest, walineDBName)
    } else {
      // 如果文件存在
      const { override } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'override',
          message: `${walineDBName}数据库已存在，是否覆盖？${colors.gray(targetFile)}`,
        },
      ])
      if (override) {
        const result = shell.rm('-f', targetFile)
        if (result.code === 0) {
          this.copyAndRename(srcFile, dest, walineDBName)
        } else {
          logger.info(`删除${targetFile}失败`)
          process.exit(1)
        }
      } else {
        logger.info(`sqlite数据库文件默认路径：${targetFile}`)
      }
    }
  }

  copyAndRename(srcFile, dest, targetFileName) {
    const dirSuffix = new Date().getTime()
    const tempDir = path.resolve(dest, `.temp_${dirSuffix}`)
    mkdirSync(tempDir)

    // 复制到临时文件夹
    if (shell.cp(srcFile, tempDir).code !== 0) {
      logger.error('准备.sqlite失败')
      process.exit(1)
    }

    // 重命名
    const tempFileName = path.basename(srcFile)
    const extname = path.extname(srcFile)
    const tempFile = path.resolve(tempDir, tempFileName)
    const tempTargetFile = path.resolve(tempDir, `${targetFileName}${extname}`)

    if (tempFile !== tempTargetFile) {
      if (shell.exec(`mv ${tempFile} ${tempTargetFile}`).code !== 0) {
        logger.error('准备.sqlite失败')
        process.exit(1)
      }
    }

    // 复制到目标文件夹
    if (shell.cp(tempTargetFile, dest).code !== 0) {
      logger.error('准备.sqlite失败')
      process.exit(1)
    }

    // 删除临时目录
    if (shell.rm('-Rf', tempDir).code !== 0) {
      logger.error('删除临时文件夹失败')
    }

    logger.info(`sqlite数据库文件默认路径：${path.resolve(dest, `${targetFileName}${extname}`)}`)
  }
}

module.exports = SqliteDatabase
