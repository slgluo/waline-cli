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

    const targetFile = path.resolve(SQLITE_PATH, `${walineDBName}.sqlite`)
    const dest = path.dirname(targetFile)

    if (!existsSync(targetFile)) {
      if (!pathExistsSync(dest)) {
        mkdirSync(dest, { recursive: true })
      }
      this.copyAndRename(srcWalineDBName, targetFile, dest)
    } else {
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
          this.copyAndRename(srcWalineDBName, targetFile, dest)
        } else {
          logger.info(`删除${targetFile}失败`)
          process.exit(1)
        }
      } else {
        logger.info(`waline.sqlite默认路径：${targetFile}`)
      }
    }
  }

  copyAndRename(srcDBName, targetFile, dest) {
    // 复制到.sqlite文件 至 SQLITE_PATH
    const result = shell.cp(path.resolve(__dirname, `${srcDBName}.sqlite`), dest)
    if (result.code !== 0) {
      logger.error('准备.sqlite失败')
      process.exit(1)
    } else {
      // 重命名为 SQLITE_DB.sqlite
      const result = shell.exec(`mv ${path.resolve(dest, `${srcDBName}.sqlite`)} ${targetFile}`)
      if (result.code === 0) {
        logger.info(`waline.sqlite默认路径：${targetFile}`)
      } else {
        // 重命名失败则删除
        shell.rm('-f', path.resolve(dest, 'waline.sqlite'))
        logger.error('准备.sqlite失败')
        process.exit(1)
      }
    }
  }
}

module.exports = SqliteDatabase
