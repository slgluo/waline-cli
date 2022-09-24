const path = require('path')

async function getLocalWalineVersion() {
  const { packageDirectorySync } = await import('pkg-dir')
  const { pathExistsSync } = await import('path-exists')

  const vercelDir = path.resolve(process.env.CONFIG_PATH, 'node_modules/@waline/vercel')
  if (!pathExistsSync(vercelDir)) {
    return
  }

  const vercelPkgDir = packageDirectorySync({
    cwd: vercelDir,
  })
  const vercelPkg = require(path.resolve(vercelPkgDir, 'package.json'))
  return vercelPkg.version
}

module.exports = {
  getLocalWalineVersion,
}
