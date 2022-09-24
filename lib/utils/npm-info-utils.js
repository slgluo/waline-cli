const axios = require('axios')
const semver = require('semver')

async function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null
  }
  const registryUrl = registry || getDefaultRegistry()

  const { default: urlJoin } = await import('url-join')

  const npmInfoUrl = urlJoin(registryUrl, npmName)
  const response = await axios.get(npmInfoUrl)
  if (response.status === 200) {
    return response.data
  }
  return null
}

function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (data) {
    return Object.keys(data.versions)
  } else {
    return []
  }
}

function getSemverVersions(baseVersion, versions) {
  return versions
    .filter(version => semver.satisfies(version, `>${baseVersion}`))
    .sort((a, b) => (semver.gt(b, a) ? 1 : -1))
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const newVersions = getSemverVersions(baseVersion, versions)
  if (newVersions && newVersions.length > 0) {
    return newVersions[0]
  }
  return null
}

async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry)
  if (versions) {
    return versions.sort((a, b) => semver.gt(b, a))[versions.length - 1]
  }
  return null
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion,
}
