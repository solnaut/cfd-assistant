import { spawn } from 'node:child_process'
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'

const rootDir = fileURLToPath(new URL('../', import.meta.url))
const distDir = path.join(rootDir, 'dist')
const screenshotsDir = path.join(rootDir, 'docs', 'screenshots')
const previewPort = 4179
const cdpPort = 9229
const baseUrl = `http://127.0.0.1:${previewPort}`

const browserCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]

const targets = [
  {
    file: 'home.png',
    route: '/',
    waitSelector: '.cover-figure img',
  },
  {
    file: 'fluent-solution.png',
    route: '/fluent-guide',
    waitSelector: '.fluent-workbench',
  },
  {
    file: 'fluent-meshing.png',
    route: '/fluent-meshing',
    waitSelector: '.fluent-workbench',
  },
  {
    file: 'calculator-yplus.png',
    route: '/calculators/near-wall-mesh/y-plus-first-layer-height',
    waitSelector: 'button[type="submit"]',
    prepareExpression: `
      (() => {
        const btn = document.querySelector('form button[type="submit"]');
        if (btn) btn.click();
        return Boolean(btn);
      })()
    `,
    afterPrepareSelector: '.boundary-plan-panel',
  },
  {
    file: 'energy-knowledge.png',
    route: '/knowledge',
    waitSelector: '.energy-workspace',
  },
  {
    file: 'thermal-lab.png',
    route: '/thermal-lab?experiment=refrigeration',
    waitSelector: '.engineering-metrics',
  },
]

async function findBrowser() {
  for (const candidate of browserCandidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Try next browser candidate.
    }
  }
  throw new Error('No Chromium-based browser (Chrome or Edge) was found for screenshot capture.')
}

async function ensureBuilt() {
  try {
    await access(path.join(distDir, 'index.html'))
  } catch {
    throw new Error('Missing dist/index.html. Run `npm.cmd run build` before `npm.cmd run screenshots`.')
  }
}

async function openCdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  let nextId = 1
  const pending = new Map()
  ws.addEventListener('message', (event) => {
    const payload = JSON.parse(String(event.data))
    if (!payload.id) return
    const waiter = pending.get(payload.id)
    if (!waiter) return
    pending.delete(payload.id)
    if (payload.error) {
      waiter.reject(new Error(`${payload.error.message} (${payload.error.code})`))
    } else {
      waiter.resolve(payload.result)
    }
  })

  function send(method, params = {}) {
    const id = nextId++
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`CDP timeout waiting for ${method}`))
      }, 20_000)
      pending.set(id, {
        resolve: (result) => {
          clearTimeout(timer)
          resolve(result)
        },
        reject: (err) => {
          clearTimeout(timer)
          reject(err)
        },
      })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }

  return {
    send,
    close: () => ws.close(),
  }
}

async function waitForPageTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${cdpPort}/json/list`)
      if (response.ok) {
        const list = await response.json()
        const page = list.find((item) => item.type === 'page' && item.webSocketDebuggerUrl)
        if (page) return page.webSocketDebuggerUrl
      }
    } catch {
      // CDP endpoint not ready yet.
    }
    await delay(250)
  }
  throw new Error('Timed out waiting for headless browser CDP endpoint.')
}

async function evalValue(cdp, expression) {
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (exceptionDetails) {
    throw new Error(exceptionDetails.text || 'Runtime evaluation failed')
  }
  return result?.value
}

async function waitUntil(fn, timeoutMs, label) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await fn()) return
    await delay(150)
  }
  throw new Error(`Timed out waiting for ${label}`)
}

async function main() {
  await ensureBuilt()
  const browserPath = await findBrowser()
  await mkdir(screenshotsDir, { recursive: true })
  const profileDir = await mkdtemp(path.join(os.tmpdir(), 'cfd-assistant-shot-'))

  let server
  let browser
  let cdp
  try {
    server = await preview({
      root: rootDir,
      appType: 'spa',
      configFile: false,
      envFile: false,
      logLevel: 'silent',
      preview: {
        host: '127.0.0.1',
        port: previewPort,
        strictPort: true,
      },
    })

    browser = spawn(
      browserPath,
      [
        '--headless=new',
        `--remote-debugging-port=${cdpPort}`,
        `--user-data-dir=${profileDir}`,
        '--window-size=1440,900',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        '--hide-scrollbars',
        'about:blank',
      ],
      { stdio: 'ignore', windowsHide: true },
    )

    const wsUrl = await waitForPageTarget()
    cdp = await openCdpClient(wsUrl)
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })

    for (const target of targets) {
      const url = `${baseUrl}${target.route}`
      await cdp.send('Page.navigate', { url })
      await waitUntil(
        () =>
          evalValue(
            cdp,
            `document.readyState === 'complete' && Boolean(document.querySelector('#root')?.children.length) && Boolean(document.querySelector(${JSON.stringify(target.waitSelector)}))`,
          ),
        15_000,
        `selector ${target.waitSelector} on ${target.route}`,
      )

      if (target.prepareExpression) {
        await evalValue(cdp, target.prepareExpression)
        if (target.afterPrepareSelector) {
          await waitUntil(
            () => evalValue(cdp, `Boolean(document.querySelector(${JSON.stringify(target.afterPrepareSelector)}))`),
            10_000,
            `afterPrepareSelector ${target.afterPrepareSelector}`,
          )
        }
      }

      await evalValue(
        cdp,
        `(async () => {
          if (document.fonts && document.fonts.ready) await document.fonts.ready;
          const imgs = Array.from(document.querySelectorAll('img'));
          await Promise.all(imgs.map((img) => img.complete ? Promise.resolve() : new Promise((res) => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
          })));
          return true;
        })()`,
      )
      await delay(350)

      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' })
      const outPath = path.join(screenshotsDir, target.file)
      await writeFile(outPath, Buffer.from(data, 'base64'))
      console.log(`Captured ${path.relative(rootDir, outPath)}`)
    }
  } finally {
    cdp?.close()
    browser?.kill()
    if (server) await server.close()
    await delay(250)
    await rm(profileDir, { recursive: true, force: true }).catch(() => {})
  }
}

await main()
