import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer as createHttpServer } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { createServer as createViteServer } from 'vite'

const browser = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(existsSync)
assert.ok(browser, 'Set CHROME_PATH to Chrome or Chromium')

const events = []
const recoveryAttempts = new Map()
let rejectRefresh = false
const testJwt = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.signature`
const api = createHttpServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'content-type, content-language, accept-language, authorization, x-sentry-auth')
  response.setHeader('Access-Control-Expose-Headers', 'x-request-id, x-server-local-time')
  if (request.method === 'OPTIONS') { response.writeHead(204).end(); return }

  if (request.url.startsWith('/api/1/envelope/')) {
    let body = ''
    for await (const chunk of request) body += chunk
    for (const line of body.split('\n')) {
      try {
        const item = JSON.parse(line)
        if (item.exception?.values) events.push(item)
      } catch { /* Envelope headers and attachments are not events. */ }
    }
    response.writeHead(200, { 'Content-Type': 'application/json' }).end('{}')
    return
  }
  if (request.url.includes('probe-network')) { request.socket.destroy(); return }
  if (request.url.includes('AuthAdmin/refresh-token')) {
    if (rejectRefresh) {
      response.writeHead(400, { 'Content-Type': 'application/json' })
        .end(JSON.stringify({ message: 'Invalid refresh token token=secret-value' }))
      return
    }
    response.setHeader('X-Server-Local-Time', new Date().toISOString())
    response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({
      succeeded: true, data: { success: true, token: testJwt, refreshToken: 'new-test-refresh-token' },
    }))
    return
  }
  if (request.url.includes('probe-refresh-400')) {
    rejectRefresh = true
    response.writeHead(401, { 'Content-Type': 'application/json' }).end('{}')
    return
  }
  if (request.url.includes('probe-recover-')) {
    const attempts = (recoveryAttempts.get(request.url) || 0) + 1
    recoveryAttempts.set(request.url, attempts)
    response.writeHead(attempts === 1 ? Number(request.url.match(/recover-(\d+)/)[1]) : 200,
      { 'Content-Type': 'application/json' }).end('{}')
    return
  }
  const status = Number(request.url.match(/probe-(\d+)/)?.[1]) || 404
  response.setHeader('X-Request-ID', `monitoring-probe-${status}`)
  response.writeHead(status, { 'Content-Type': 'application/json' })
    .end(JSON.stringify({
      ...(status === 200 ? { succeeded: false } : {}),
      message: 'Unexpected Error for test@example.com token=secret-value',
    }))
})
await new Promise((resolve) => api.listen(0, '127.0.0.1', resolve))
const apiPort = api.address().port
process.env.VITE_SENTRY_DSN = `http://public@127.0.0.1:${apiPort}/1`

const profile = await mkdtemp(path.join(os.tmpdir(), 'admin-monitoring-browser-'))
const vite = await createViteServer({ server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' })
try {
  await vite.listen()
  const appPort = vite.httpServer.address().port
  const runBrowser = (kind) => new Promise((resolve, reject) => {
    const url = `http://127.0.0.1:${appPort}/scripts/fixtures/monitoring.html?apiPort=${apiPort}&kind=${kind}`
    const child = spawn(browser, [
      '--headless=new', '--disable-gpu', '--disable-gpu-sandbox', '--no-sandbox',
      '--disable-software-rasterizer', '--disable-extensions', '--no-first-run',
      '--no-default-browser-check', '--virtual-time-budget=5000', '--dump-dom',
      `--user-data-dir=${path.join(profile, kind)}`, url,
    ], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    let html = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { html += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    const timer = setTimeout(() => { child.kill(); reject(new Error(`${kind} browser timed out: ${stderr}`)) }, 30000)
    child.on('error', (error) => { clearTimeout(timer); reject(error) })
    child.on('exit', (code) => {
      clearTimeout(timer)
      if (code !== 0) reject(new Error(`${kind} browser exited ${code}: ${stderr}`))
      else resolve(html)
    })
  })
  const waitFor = async (predicate, label) => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const event = events.find(predicate)
      if (event) return event
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    throw new Error(`${label} event was not received; events: ${JSON.stringify(events.map((event) => ({
      value: event.exception?.values?.[0]?.value, api: event.contexts?.api,
    })))}`)
  }

  for (const kind of ['runtime', 'promise', 'network', '401', '403', '500', '200', 'render']) {
    const html = await runBrowser(kind)
    assert.ok(html.includes(`data-probe-done="${kind}"`), `${kind} fixture did not finish: ${html.slice(-1500)}`)
    const event = await waitFor((item) => kind === 'runtime' || kind === 'promise'
      ? item.exception.values.some((value) => value.value?.includes(`monitoring ${kind} probe`))
      : kind === 'render'
        ? item.exception.values.some((value) => value.value?.includes('monitoring render probe'))
        : item.contexts?.api?.endpoint?.endsWith(`probe-${kind}`), kind)
    if (['401', '403', '500', '200'].includes(kind)) {
      assert.equal(event.contexts.api.status, Number(kind))
      assert.equal(event.contexts.api.request_id, `monitoring-probe-${kind}`)
    }
    if (kind === 'network') assert.equal(event.contexts.api.status, 'network')
    if (kind === '200') assert.equal(event.contexts.api.error_code, 'BUSINESS_FAILURE')
    const frames = event.exception.values.flatMap((value) => value.stacktrace?.frames || [])
    if (['network', '401', '403', '500'].includes(kind)) {
      const reporting = event.exception.values.find((value) => value.type === 'ApiRequestError')
      const transport = event.exception.values.find((value) => value.type === 'AxiosTransportError')
      assert.ok(reporting?.stacktrace?.frames?.some((frame) => frame.filename?.includes('/src/shared/api/axiosInstance.js')),
        `${kind} needs an application reporting frame`)
      assert.ok(transport?.stacktrace?.frames?.some((frame) => frame.filename?.includes('/node_modules/')),
        `${kind} needs the original Axios transport frames`)
    }
    assert.ok(frames.some((frame) => frame.filename?.startsWith('http') &&
      frame.lineno && frame.colno), `${kind} event needs a source frame with line and column`)
    if (kind === 'render') {
      assert.ok(event.exception.values[0].stacktrace?.frames?.length)
      assert.ok(event.exception.values[0].stacktrace.frames.some((frame) => frame.function === 'Crash'))
      assert.ok(html.includes('Safe fallback'))
    }
    if (kind === '500' || kind === '200') assert.ok(html.includes('data-toast-visible="false"'))
    assert.equal(event.environment, 'development')
    assert.ok(event.release)
    assert.ok(event.timestamp)
    assert.ok(event.contexts.browser?.name)
    assert.ok(event.contexts.os?.name)
    assert.ok(event.request?.url?.includes('/scripts/fixtures/monitoring.html'))
    assert.ok(event.breadcrumbs?.some((breadcrumb) => breadcrumb.category === 'ui.action'))
    const serialized = JSON.stringify(event)
    const secretAt = serialized.indexOf('secret-value')
    assert.equal(secretAt, -1, serialized.slice(Math.max(0, secretAt - 120), secretAt + 120))
    assert.ok(!JSON.stringify(event).includes('test@example.com'))
    console.log(`Received ${kind} event`)
  }
  for (const kind of ['recover-401', 'recover-403']) {
    const html = await runBrowser(kind)
    assert.ok(html.includes('data-recovered="true"'))
    assert.ok(recoveryAttempts.get(`/api/probe-${kind}`) === 2)
    assert.ok(!events.some((event) => event.contexts?.api?.endpoint?.endsWith(`probe-${kind}`)))
    console.log(`${kind} refreshed and retried without a terminal error event`)
  }
  const refreshHtml = await runBrowser('refresh-400')
  assert.ok(refreshHtml.includes('data-probe-done="refresh-400"'))
  const refreshEvent = await waitFor((item) =>
    item.contexts?.api?.endpoint?.endsWith('/AuthAdmin/refresh-token') &&
    item.contexts.api.status === 400, 'refresh-400')
  const refreshReporting = refreshEvent.exception.values.find((value) => value.type === 'ApiRequestError')
  const refreshTransport = refreshEvent.exception.values.find((value) => value.type === 'AxiosTransportError')
  assert.ok(refreshReporting?.stacktrace?.frames?.some((frame) =>
    frame.filename?.includes('/src/shared/api/axiosInstance.js')))
  assert.ok(refreshTransport?.stacktrace?.frames?.some((frame) =>
    frame.filename?.includes('/node_modules/')))
  assert.equal(events.filter((item) =>
    item.contexts?.api?.endpoint?.endsWith('/AuthAdmin/refresh-token')).length, 1)
  assert.deepEqual(refreshEvent.fingerprint, [
    'api', 'POST', refreshEvent.contexts.api.endpoint, '400',
  ])
  assert.ok(!JSON.stringify(refreshEvent).includes('secret-value'))
  assert.ok(!JSON.stringify(refreshEvent).includes('test-refresh-token'))
  console.log('Received terminal refresh-400 event with application and Axios frames')
  console.log(`Monitoring browser smoke passed: ${events.length} events received locally.`)
} finally {
  await vite.close()
  await new Promise((resolve) => api.close(resolve))
  assert.ok(profile.startsWith(path.join(os.tmpdir(), 'admin-monitoring-browser-')))
  await rm(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 })
}
