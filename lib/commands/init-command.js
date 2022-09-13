const inquirer = require('inquirer')
const colors = require('colors')
const { BaseCommand } = require('./base-command')
const { templates, getTemplateNames, getEnvVarsByName } = require('../template')
const { MysqlDatabase, SqliteDatabase } = require('../databases')
const { pm2, DotenvUtils } = require('../utils')

const prompt = inquirer.createPromptModule()

class InitCommand extends BaseCommand {
  async exec() {
    // 1.选择存储类型
    const { type } = await prompt([
      {
        type: 'list',
        name: 'type',
        message: '存储类型',
        choices: getTemplateNames(),
      },
    ])
    const { force } = this.cmdObj
    // 强制覆盖，清除所有waline相关变量
    if (force) {
      this.clearEnv()
      DotenvUtils.set('WALINE_DB', type)
    } else {
      const currentType = DotenvUtils.get('WALINE_DB')
      // 如果和当前设置（即上次运行时的设置）的存储类型不一致，则清除
      if (currentType !== type) {
        this.clearEnv()
        DotenvUtils.set('WALINE_DB', type)
      }
    }

    // 2.选择需要设置的环境变量
    const { selectedList } = await prompt([
      {
        type: 'checkbox',
        name: 'selectedList',
        message: '选择需要设置的变量',
        choices: this.getEnvVarChoices(type),
        loop: false,
      },
    ])

    // 3.设置变量
    const envVars = getEnvVarsByName(type)
    const inputs = this.getInputs(type, envVars, selectedList)

    const envVarList = []
    for (let input of inputs) {
      const result = await input()
      if (process.env[result.key]) {
        const { override } = await prompt([
          {
            type: 'confirm',
            name: 'override',
            message: `${colors.red(result.key)}已存在，是否覆盖？`,
          },
        ])
        if (override) {
          envVarList.push(result)
        }
      } else {
        envVarList.push(result)
      }
    }
    const envObj = {}
    envVarList.forEach(v => (envObj[v.key] = v.value))
    // 清除没有选择的环境变量
    const exclude = envVars.filter(v => !selectedList.includes(v))
    DotenvUtils.remove(exclude)

    this.setEnvVars(envObj)

    // 4.初始化数据库（如果需要）
    if (type === 'MySQL') {
      await new MysqlDatabase().init()
    } else if (type === 'SQLite') {
      await new SqliteDatabase().init()
    }

    // 5.启动服务
    const { isStartNow } = await prompt([
      {
        type: 'confirm',
        name: 'isStartNow',
        message: '是否现在启动服务？',
        default: false,
      },
    ])
    if (isStartNow) {
      pm2.start()
    }
  }

  /**
   * 覆盖配置
   */
  clearEnv() {
    DotenvUtils.clear()
  }

  getEnvVarChoices(type) {
    const envVarObj = templates[type]
    const keys = Reflect.ownKeys(envVarObj)
    return keys.map(key => {
      const exists = key in process.env
      const required = envVarObj[key].required
      let tips = ''
      if (required && !exists) {
        tips = '(必选)'
      }
      if (!required && exists) {
        tips = '(已存在，覆盖请选择)'
      }
      if (required && exists) {
        tips = '(必选，已存在)'
      }
      return {
        name: `${key}${colors.gray(tips)}`,
        value: key,
        short: key,
        checked: required || exists,
      }
    })
  }

  getInputs(type, vars, include) {
    return vars
      .filter(v => include.includes(v))
      .map(v => {
        return function () {
          return new Promise((resolve, reject) => {
            prompt([
              {
                type: 'input',
                name: v,
                message: `设置${colors.green(v)}`,
                default: templates[type][v].default,
                validate: input => {
                  const valueType = templates[type][v].type
                  if (valueType === 'number') {
                    const v = Number(input)
                    return !isNaN(v)
                  } else if (valueType === 'boolean') {
                    return input === 'true' || input === 'false'
                  } else {
                    return !!input
                  }
                },
              },
            ])
              .then(result => {
                resolve({ key: v, value: result[v] })
              })
              .catch(error => {
                reject(error)
              })
          })
        }
      })
  }
}

module.exports = function (args) {
  new InitCommand(args)
}
