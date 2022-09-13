class Database {
  constructor() {}

  async init() {
    throw Error('init need implements')
  }
}

module.exports = {
  Database,
}
