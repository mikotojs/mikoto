import cp from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * 需要排除的 package
 */
const EXCLUDE_PKG = ['core', 'tsconfig']

/**
 * 获取工作目录路径
 */
function getCwd() {
  return process.cwd()
}

/**
 * 获取 packages 目录
 */
function getPackagesPath() {
  return path.resolve(getCwd(), './packages')
}

function fmt(...paths: string[]) {
  cp.spawn('npx', ['dprint', 'fmt', ...paths])
}

function getSubdirectories(path: string) {
  return fs.readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

function writeTsFile(dirs: string[], packagesPath: string) {
  // const indexTS = dirs.reduce((ts, dirname) => `${ts}export * from '@mikotojs/${dirname}';`, '')
  const indexTS = dirs.reduce((ts, dirname) => `${ts}export * from '../${dirname}';`, '')
  const indexTSPath = path.resolve(packagesPath, './core/index.ts')

  fs.writeFileSync(indexTSPath, indexTS, 'utf8')

  return indexTSPath
}

async function writePkgFile(dirs: string[], packagesPath: string) {
  const pkgPath = path.resolve(packagesPath, './core/package.json')
  const pkg = await import(pkgPath)
  const pkgFile = pkg.default
  pkgFile.dependencies ||= {}
  dirs.forEach(dir => pkgFile.dependencies[`@mikotojs/${dir}`] = 'workspace:*')

  fs.writeFileSync(pkgPath, JSON.stringify(pkgFile), 'utf8')

  return pkgPath
}

async function run() {
  // 获取 packages 下的所有目录
  const packagesPath = getPackagesPath()
  const dirs = getSubdirectories(packagesPath).filter(dirname => !EXCLUDE_PKG.includes(dirname))

  fmt(writeTsFile(dirs, packagesPath), await writePkgFile(dirs, packagesPath))

  cp.spawn('pnpm', ['i'])
}

await run()
