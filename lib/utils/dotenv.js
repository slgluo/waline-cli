const path = require('path')
const dotenv = require('dotenv')
const { readFileSync, writeFileSync } = require('fs')
const { getAllEnvVar } = require('../template')

const getEnvPath = () => {
  return path.resolve(process.env.CONFIG_PATH, '.env')
}

const getEnv = () => {
  const envFilePath = getEnvPath()
  return dotenv.parse(readFileSync(envFilePath))
}

const update = (env = {}) => {
  const envFilePath = getEnvPath()

  let content = ''
  Reflect.ownKeys(env).forEach(v => (content += `${v}=${env[v]}\n`))
  writeFileSync(envFilePath, content)
  // 使环境变量生效
  dotenv.config({ path: envFilePath, override: true })
}

const get = key => {
  const originalEnv = getEnv()
  return originalEnv[key]
}

const set = (key, value = '') => {
  if (!key) {
    return
  }
  const originalEnv = getEnv()
  originalEnv[key] = value
  update(originalEnv)
}

const remove = key => {
  if (!key) {
    return
  }
  const originalEnv = getEnv()

  if (typeof key === 'string') {
    if (key in originalEnv) {
      delete originalEnv.key
      if (key in process.env) {
        delete process.env[key]
      }
      update(originalEnv)
    }
  } else if (Array.isArray(key)) {
    key.forEach(k => {
      if (k in originalEnv) {
        delete originalEnv[k]
      }
      if (k in process.env) {
        delete process.env[k]
      }
    })
    update(originalEnv)
  }
}

const clear = () => {
  const vars = getAllEnvVar()
  vars.forEach(v => {
    if (v in process.env) {
      delete process.env[v]
    }
  })
  update({})
}

const has = key => {
  const originalEnv = getEnv()
  return key in originalEnv
}

module.exports = {
  update,
  get,
  set,
  remove,
  clear,
  has,
  getEnv,
  getEnvPath,
}
