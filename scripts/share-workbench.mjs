import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { createInterface } from 'node:readline'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'

const root = new URL('../', import.meta.url)
const runtime = new URL('.share-runtime/', root)
const binary = new URL('cloudflared-2026.11.1-windows-amd64.exe', runtime)
const urlFile = new URL('public-url.txt', runtime)
const checksum = '341deda3db5ec498a0482254d6c38c0b7cf01a30c37bb5dd95d2216d08955e35'
const download = 'https://github.com/cloudflare/cloudflared/releases/download/2026.11.1/cloudflared-windows-amd64.exe'
const sharePort = 4174
const originUrl = `http://127.0.0.1:${sharePort}`

function verifyBinary(bytes) {
  if (createHash('sha256').update(bytes).digest('hex') !== checksum) {
    throw new Error('cloudflared checksum mismatch. Check the copy in .share-runtime.')
  }
}

async function prepareCloudflared() {
  if (process.platform !== 'win32' || process.arch !== 'x64') {
    throw new Error('The public sharing launcher requires Windows x64.')
  }
  try {
    const cached = await readFile(binary)
    verifyBinary(cached)
    return
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  console.log('Downloading the official Cloudflare tunnel tool for first use...')
  await mkdir(runtime, { recursive: true })
  const response = await fetch(download, { signal: AbortSignal.timeout(90_000) })
  if (!response.ok) throw new Error(`cloudflared download failed with HTTP ${response.status}.`)
  const bytes = Buffer.from(await response.arrayBuffer())
  verifyBinary(bytes)
  await writeFile(binary, bytes)
}

function tunnelUrl(child, recentLines) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => failed('Cloudflare did not provide a public URL within 45 seconds.'), 45_000)

    function failed(message) {
      clearTimeout(timer)
      reject(new Error([message, ...recentLines.slice(-4)].join('\n')))
    }

    child.once('error', (error) => failed(error.message))
    child.once('exit', (code) => failed(`Cloudflare tunnel exited with code ${code}.`))
    for (const stream of [child.stdout, child.stderr]) {
      createInterface({ input: stream }).on('line', (line) => {
        recentLines.push(line)
        if (recentLines.length > 8) recentLines.shift()
        const url = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com\b/i)?.[0]
        if (url) {
          clearTimeout(timer)
          resolve(url)
        }
      })
    }
  })
}

let server
let tunnel
let stopping = false

async function stop(exitCode) {
  if (stopping) return
  stopping = true
  tunnel?.kill()
  if (server) {
    await rm(urlFile, { force: true })
    await server.close()
  }
  process.exitCode = exitCode
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.once(signal, () => { void stop(0) })
}

try {
  await prepareCloudflared()
  if (!stopping) {
    console.log('Starting public sharing for the built CFD Assistant site...')
    server = await preview({
      root: fileURLToPath(root),
      configFile: false,
      envFile: false,
      logLevel: 'silent',
      preview: {
        host: '127.0.0.1',
        port: sharePort,
        strictPort: true,
        allowedHosts: ['.trycloudflare.com'],
      },
    })
    if (stopping) {
      await server.close()
    } else {
      await rm(urlFile, { force: true })
      const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^TUNNEL_/i.test(key)))
      tunnel = spawn(fileURLToPath(binary), [
        'tunnel', '--no-autoupdate', '--url', originUrl, '--http-host-header', '127.0.0.1',
      ], { cwd: fileURLToPath(root), env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
      const recentLines = []
      const url = await tunnelUrl(tunnel, recentLines)
      tunnel.once('exit', (code) => {
        if (!stopping) console.error('The Cloudflare tunnel has closed.')
        void stop(code || 1)
      })
      let lastCheck = ''
      for (let attempt = 0; attempt < 25 && !stopping; attempt++) {
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(4000) })
          const page = await response.text()
          if (response.ok && page.includes('<title>CFD Assistant</title>')) {
            await writeFile(urlFile, url + '\n')
            console.log(`\nPublic link: ${url}\n\nKeep this window open while sharing. Press Ctrl+C to stop.`)
            break
          }
          lastCheck = `HTTP ${response.status}${response.ok ? ' with unexpected content' : ''}`
        } catch (error) {
          if (stopping) break
          lastCheck = error.cause?.message ?? error.message
        }
        if (attempt === 24) {
          throw new Error([`Could not verify the public URL (${lastCheck}).`, ...recentLines.slice(-4)].join('\n'))
        }
        await delay(1000)
      }
    }
  }
} catch (error) {
  if (!stopping) {
    console.error(error.message)
    await stop(1)
  }
}
