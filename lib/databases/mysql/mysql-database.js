const mysql = require('mysql')
const { Database } = require('../database')
const { logger } = require('../../utils')
const statements = require('./statement')

class MysqlDatabase extends Database {
  constructor() {
    super()
    this.connection = null
  }

  async init() {
    try {
      await this.connect()
      await this.createDatabase()
      await this.createTables()
    } catch (e) {
      process.exit(1)
    }
  }

  async connect() {
    const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD } = process.env
    this.connection = mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
    })

    return new Promise((resolve, reject) => {
      logger.info('正在连接数据库...')
      this.connection.connect((err, result) => {
        if (!err) {
          logger.info('连接数据库成功')
          resolve(result)
        } else {
          logger.error('连接数据库失败')
          reject(err)
        }
      })
    })
  }

  createDatabase() {
    const { MYSQL_DB } = process.env
    return new Promise((resolve, reject) => {
      logger.info('正在创建数据库...')
      this.connection.query(`CREATE DATABASE ${MYSQL_DB}`, (err, result) => {
        if (err) {
          logger.error(`数据库${MYSQL_DB}创建失败`)
          logger.error(err)
          reject(err)
        } else {
          logger.info(`数据库${MYSQL_DB}创建成功`)
          resolve(result)
        }
      })
    })
  }

  createTables() {
    const { MYSQL_DB } = process.env

    const createTable = (name, statement) => {
      return new Promise((resolve, reject) => {
        logger.info(`正在创建${name}表...`)
        this.connection.query(statement, (err, res) => {
          if (err) {
            logger.error(`创建${name}表失败`)
            reject(err)
          }
          logger.info(`创建${name}表成功`)
          resolve(res)
        })
      })
    }

    return new Promise((resolve, reject) => {
      this.connection.query(`use ${MYSQL_DB}`, () => {
        const create = Promise.resolve()
        create
          .then(createTable('commen', statements.comment))
          .then(createTable('counter', statements.counter))
          .then(createTable('user', statements.user))
          .catch(err => {
            reject(err)
          })
          .finally(() => {
            this.connection.end()
          })
      })
      resolve()
    })
  }
}

module.exports = MysqlDatabase
