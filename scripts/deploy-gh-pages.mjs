import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('../', import.meta.url))
const pagesOutDirName = '.gh-pages-dist'
const pagesOutDir = path.join(rootDir, pagesOutDirName)
const rawBase = process.env.VITE_BASE_PATH || '/cfd-assistant/'
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

function runCommand(command, args, cwd, env = process.env) {
  if (process.platform === 'win32' && command.endsWith('.cmd')) {
    return execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', command, ...args], {
      cwd,
      env,
      stdio: 'inherit',
    })
  }
  return execFileSync(command, args, { cwd, env, stdio: 'inherit' })
}

function captureOutput(command, args, cwd) {
  return execFileSync(command, args, { cwd, encoding: 'utf8' }).trim()
}

const redirectHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>CFD Assistant</title>
    <script>
      ;(function () {
        var base = ${JSON.stringify(base)}
        var target = window.location.pathname + window.location.search + window.location.hash
        try {
          window.sessionStorage.setItem('cfd-assistant:spa-redirect', target)
        } catch {
          // Ignore storage restrictions.
        }
        window.location.replace(base)
      })()
    </script>
  </head>
  <body></body>
</html>
`

async function main() {
  const originUrl = captureOutput('git', ['remote', 'get-url', 'origin'], rootDir)
  const shortSha = captureOutput('git', ['rev-parse', '--short', 'HEAD'], rootDir)
  let authorName = 'solnaut'
  let authorEmail = '231035815+solnaut@users.noreply.github.com'
  try {
    authorName = captureOutput('git', ['config', 'user.name'], rootDir) || authorName
    authorEmail = captureOutput('git', ['config', 'user.email'], rootDir) || authorEmail
  } catch {
    // Fall back to repository maintainer identity.
  }

  const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const tempRepo = await mkdtemp(path.join(os.tmpdir(), 'cfd-assistant-pages-'))

  try {
    await rm(pagesOutDir, { recursive: true, force: true })
    console.log(`Building CFD Assistant for GitHub Pages (base: ${base})...`)
    runCommand(npmBin, ['run', 'build'], rootDir, {
      ...process.env,
      VITE_BASE_PATH: base,
      VITE_OUT_DIR: pagesOutDirName,
    })

    await writeFile(path.join(pagesOutDir, '.nojekyll'), '')
    await writeFile(path.join(pagesOutDir, '404.html'), redirectHtml)

    await cp(pagesOutDir, tempRepo, { recursive: true })
    runCommand('git', ['init', '-b', 'gh-pages'], tempRepo)
    runCommand('git', ['config', 'user.name', authorName], tempRepo)
    runCommand('git', ['config', 'user.email', authorEmail], tempRepo)
    runCommand('git', ['add', '-A'], tempRepo)
    runCommand('git', ['commit', '-m', `Deploy CFD Assistant to GitHub Pages (${shortSha})`], tempRepo)
    runCommand('git', ['push', '--force', originUrl, 'gh-pages:gh-pages'], tempRepo)
    console.log(`Deployed gh-pages branch from ${shortSha} to ${originUrl}`)
  } finally {
    await rm(tempRepo, { recursive: true, force: true }).catch(() => {})
    await rm(pagesOutDir, { recursive: true, force: true }).catch(() => {})
  }
}

await main()
