const path = require('path')
const { homedir } = require('os')
const { CONFIG_DIR } = require('./const')

const templates = {
  MongoDB: {
    // MongoDB 服务的地址，支持数组格式
    MONGO_HOST: {
      required: false,
      default: '127.0.0.1',
      type: 'string',
    },
    // MongoDB 服务的端口，支持数组格式
    MONGO_PORT: {
      required: false,
      default: 27017,
      type: 'number',
    },
    // MongoDB 数据库名称
    MONGO_DB: {
      required: true,
      default: undefined,
      type: 'string',
    },
    // MongoDB 服务的用户名
    MONGO_USER: {
      required: true,
      type: 'string',
    },
    // MongoDB 服务的密码
    MONGO_PASSWORD: {
      required: true,
      type: 'string',
    },
    // MongoDB 集群
    MONGO_REPLICASET: {
      required: false,
      type: 'string',
    },
    // MongoDB 认证源
    MONGO_AUTHSOURCE: {
      required: false,
      type: 'string',
    },
    // 是否使用 SSL 进行连接
    MONGO_OPT_SSL: {
      required: false,
      default: false,
      type: 'boolean',
    },
  },

  MySQL: {
    // MySQL 服务的地址
    MYSQL_HOST: {
      required: false,
      default: '127.0.0.1',
      type: 'string',
    },
    // MySQL 服务的端口
    MYSQL_PORT: {
      required: false,
      default: 3306,
      type: 'number',
    },
    // MySQL 数据库库名
    MYSQL_DB: {
      required: true,
      type: 'string',
    },
    // MySQL 数据库的用户名
    MYSQL_USER: {
      required: true,
      type: 'string',
    },
    // MySQL 数据库的密码
    MYSQL_PASSWORD: {
      required: true,
      type: 'string',
    },
    // MySQL 数据表的表前缀
    MYSQL_PREFIX: {
      required: false,
      default: 'wl_',
      type: 'string',
    },
    // MySQL 数据表的字符集
    MYSQL_CHARSET: {
      required: false,
      default: 'utf8mb4',
      type: 'string',
    },
    // 是否使用 SSL MYSQL 连接数据库
    MYSQL_SSL: {
      required: false,
      default: false,
      type: 'boolean',
    },
  },

  SQLite: {
    // SQLite 数据库文件的路径，该路径不包含文件名本身
    SQLITE_PATH: {
      required: true,
      default: path.resolve(homedir(), CONFIG_DIR, 'data'),
      type: 'string',
    },
    // SQLite 数据库文件名，若文件名变化需要修改该字段值
    SQLITE_DB: {
      required: false,
      type: 'string',
    },
    // SQLite 数据表的表前缀
    SQLITE_PREFIX: {
      required: false,
      default: 'wl_',
      type: 'string',
    },
    // 用户登录密钥，随机字符串即可
    JWT_TOKEN: {
      required: true,
      type: 'string',
    },
  },

  PostgreSQL: {
    // PostgreSQL 服务的地址
    PG_HOST: {
      required: false,
      default: '127.0.0.1',
      type: 'string',
    },
    //	PostgreSQL 服务的端口
    PG_PORT: {
      required: false,
      default: 3211,
      type: 'number',
    },
    // PostgreSQL 数据库库名
    PG_DB: {
      required: true,
      type: 'string',
    },
    // PostgreSQL 数据库的用户名
    PG_USER: {
      required: true,
      type: 'string',
    },
    // PostgreSQL 数据库的密码
    PG_PASSWORD: {
      required: true,
      type: 'string',
    },
    // PostgreSQL 数据表的表前缀
    PG_PREFIX: {
      required: false,
      default: 'wl_',
      type: 'string',
    },
    // 是否使用 SSL 连接 PostgreSQL 数据库
    PG_SSL: {
      required: false,
      default: false,
      type: 'boolean',
    },
  },

  CloudBase: {
    // 腾讯云开发环境 ID
    TCB_ENV: {
      required: true,
      type: 'string',
    },
    // 腾讯云 API 密钥 ID，在此获取
    TCB_ID: {
      required: true,
      type: 'string',
    },
    // 腾讯云 API 密钥 Key，在此获取
    TCB_KEY: {
      required: true,
      type: 'string',
    },
    // 用户登录密钥，如果没有配任何环境变量的话需要配置此变量，随机字符串即可
    JWT_TOKEN: {
      required: false,
      type: 'string',
    },
  },

  GitHub: {
    // Personal access tokens
    GITHUB_TOKEN: {
      required: true,
      type: 'string',
    },
    // 仓库名称，例如 walinejs/waline
    GITHUB_REPO: {
      required: true,
      type: 'string',
    },
    GITHUB_PATH: {
      required: false,
      type: 'string',
    },
  },

  DetaBase: {
    // Deta 项目密钥
    DETA_PROJECT_KEY: {
      required: true,
      type: 'string',
    },
  },
}

const getTemplateNames = () => {
  return Reflect.ownKeys(templates)
}

const getEnvVarsByName = templateName => {
  if (templateName in templates) {
    return Reflect.ownKeys(templates[templateName])
  } else {
    return []
  }
}

const getAllEnvVar = () => {
  const templateNames = getTemplateNames()
  return templateNames.reduce(
    (names, templateName) => [...names, ...getEnvVarsByName(templateName)],
    []
  )
}

module.exports = {
  templates,
  getTemplateNames,
  getEnvVarsByName,
  getAllEnvVar,
}
