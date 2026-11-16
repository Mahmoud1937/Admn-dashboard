/* global __APP_RELEASE__ */
import * as Sentry from '@sentry/react'
import axios from 'axios'

const reportedApiErrors = new WeakSet()
const reportedResponses = new WeakSet()
const reportedHandledErrors = new WeakSet()
const identityKey = 'medicard-monitoring-id'
let currentRoute = safePath(window.location.pathname)

function safePath(path = '/') {
  return path.split('/').map((part) => {
    if (!part) return part
    if (/^\d+$|^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(part) ||
        part.length > 48 || /@|%40/i.test(part)) return ':id'
    return /^[a-z0-9._~-]+$/i.test(part) ? part : ':value'
  }).join('/')
}

function safeUrl(value, base) {
  try {
    const url = new URL(value, base || window.location.origin)
    return `${url.origin}${safePath(url.pathname)}`
  } catch {
    return '[unavailable]'
  }
}

function safeFrameUrl(value) {
  try {
    const url = new URL(value)
    // Keep emitted asset filenames intact: Sentry needs them for source maps.
    if (/\/assets\/[^/]+\.(?:js|mjs|cjs)$/.test(url.pathname) ||
        url.pathname.startsWith('/src/') || url.pathname.startsWith('/node_modules/')) {
      return `${url.origin}${url.pathname}`
    }
  } catch { /* Fall through to the general URL sanitizer. */ }
  return safeUrl(value)
}

function redactText(value, limit = 1000, preserveFrames = false) {
  if (typeof value !== 'string') return undefined
  return value.slice(0, limit)
    .replace(/\bBearer\s+\S+/gi, 'Bearer [redacted]')
    .replace(/\b[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, '[redacted-token]')
    .replace(/\b(password|passcode|token|access[_-]?token|refresh[_-]?token|api[_-]?key|client[_-]?secret|authorization|secret)\s*[:=]\s*\S+/gi, '$1=[redacted]')
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[redacted-email]')
    .replace(/(?<![\w.])\+?\d(?:[\s()-]*\d){9,}(?![\w.])/g, '[redacted-number]')
    .replace(/https?:\/\/[^\s)#?]+(?:\?[^)\s#]*)?/gi, (value) => {
      const frame = value.match(/^(.*?)(:\d+:\d+)$/)
      const url = frame?.[1] || value
      return `${preserveFrames ? safeFrameUrl(url) : safeUrl(url)}${frame?.[2] || ''}`
    })
}

function anonymousInstallId() {
  try {
    let id = window.localStorage.getItem(identityKey)
    if (!id) {
      id = crypto.randomUUID()
      window.localStorage.setItem(identityKey, id)
    }
    return id
  } catch {
    return undefined
  }
}

function browserAndOs() {
  const agent = navigator.userAgent
  const browser = agent.match(/Edg\/([\d.]+)/) || agent.match(/Chrome\/([\d.]+)/) ||
    agent.match(/Firefox\/([\d.]+)/) || agent.match(/Version\/([\d.]+).*Safari/)
  const name = agent.includes('Edg/') ? 'Edge' : agent.includes('Chrome/') ? 'Chrome' :
    agent.includes('Firefox/') ? 'Firefox' : agent.includes('Safari/') ? 'Safari' : 'Other'
  const os = /Windows/i.test(agent) ? 'Windows' : /Android/i.test(agent) ? 'Android' :
    /iPhone|iPad|iPod/i.test(agent) ? 'iOS' : /Mac OS X/i.test(agent) ? 'macOS' :
      /Linux/i.test(agent) ? 'Linux' : 'Other'
  return { browser: { name, version: browser?.[1] }, os: { name: os } }
}

function cleanEvent(event, hint) {
  if (hint?.originalException && typeof hint.originalException === 'object' &&
      reportedApiErrors.has(hint.originalException)) return null

  event.request = { url: `${window.location.origin}${currentRoute}` }
  event.user = event.user?.id ? { id: event.user.id } : undefined
  event.extra = undefined
  event.message = redactText(event.message)
  event.tags = { ...event.tags, route: currentRoute }
  if (event.exception?.values) {
    for (const exception of event.exception.values) {
      exception.value = redactText(exception.value)
      if (exception.stacktrace?.frames) {
        for (const frame of exception.stacktrace.frames) {
          if (frame.filename?.startsWith('http')) frame.filename = safeFrameUrl(frame.filename)
          if (frame.abs_path?.startsWith('http')) frame.abs_path = safeFrameUrl(frame.abs_path)
        }
      }
    }
  }
  // Only explicitly constructed contexts may leave the browser.
  event.contexts = Object.fromEntries(
    Object.entries(event.contexts || {}).filter(([key]) =>
      ['api', 'react', 'trace', 'browser', 'os', 'runtime'].includes(key)
    )
  )
  return event
}

export function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    if (import.meta.env.DEV) console.info('[monitoring] Set VITE_SENTRY_DSN to send development errors to Sentry.')
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: __APP_RELEASE__,
    sendDefaultPii: false,
    attachStacktrace: true,
    maxBreadcrumbs: 30,
    integrations: (defaults) => defaults.filter(({ name }) =>
      !['Breadcrumbs', 'HttpContext'].includes(name)
    ),
    beforeSend: cleanEvent,
  })

  const id = anonymousInstallId()
  if (id) Sentry.setUser({ id })
  const { browser, os } = browserAndOs()
  Sentry.setContext('browser', browser)
  Sentry.setContext('os', os)
  Sentry.addBreadcrumb({ category: 'navigation', message: currentRoute })
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('button, a, input[type="submit"]') : null
    if (!target) return
    Sentry.addBreadcrumb({
      category: 'ui.action',
      message: `click ${target.tagName.toLowerCase()}`,
      data: { route: currentRoute },
    })
  }, true)
}

export function recordRoute(path, pattern) {
  currentRoute = pattern || safePath(path)
  Sentry.addBreadcrumb({ category: 'navigation', message: currentRoute })
}

export function reportRouteError(error) {
  reportHandledError(error, 'react-router')
}

export function reportHandledError(error, origin) {
  if (!error || axios.isCancel(error)) return
  if (error.config || error.response?.config) {
    reportApiError(error)
    return
  }
  if (typeof error === 'object') {
    if (reportedHandledErrors.has(error)) return
    reportedHandledErrors.add(error)
  }
  const exception = error instanceof Error ? error : new Error(
    typeof error?.status === 'number' ? `Route response ${error.status}` : String(error)
  )
  if (import.meta.env.DEV) console.error(`[${origin} error]`, redactText(exception.stack, 100000, true))
  Sentry.captureException(exception, { tags: { origin } })
}

export function reportApiError(error, fallbackEndpoint) {
  if (!error || axios.isCancel(error)) return
  if (error.response && typeof error.response === 'object') {
    if (reportedResponses.has(error.response)) return
    reportedResponses.add(error.response)
  }
  if (typeof error === 'object') {
    if (reportedApiErrors.has(error)) return
    reportedApiErrors.add(error)
  }
  const request = error.config || error.response?.config
  const endpoint = safeUrl(request?.url || fallbackEndpoint || '/api', request?.baseURL)
  const method = String(request?.method || (fallbackEndpoint ? 'post' : 'unknown')).toUpperCase()
  const status = error.response?.status ?? 'network'
  const headers = error.response?.headers
  const requestId = headers?.get?.('x-request-id') || headers?.get?.('x-correlation-id') ||
    headers?.['x-request-id'] || headers?.['x-correlation-id'] ||
    error.response?.data?.requestId
  const safeRequestId = typeof requestId === 'string' && /^[\w.-]{1,128}$/.test(requestId)
    ? requestId : undefined
  const responseMessage = redactText(error.response?.data?.message)
  const safeError = new Error(`${method} ${endpoint} failed (${status})`)
  safeError.name = 'ApiRequestError'
  if (typeof error.stack === 'string') {
    // Keep this reporting stack for an application-owned frame. Axios's browser
    // stack may contain only transport frames, so retain it as a separate cause.
    const transportError = new Error(redactText(error.message) || 'Request failed')
    transportError.name = 'AxiosTransportError'
    transportError.stack = redactText(error.stack, 100000, true)
    safeError.cause = transportError
  }
  if (import.meta.env.DEV) console.error('[API error]', safeError, {
    endpoint, method, status, request_id: safeRequestId, response_message: responseMessage,
  })

  Sentry.captureException(safeError, {
    fingerprint: ['api', method, endpoint, String(status)],
    tags: { origin: 'api', api_status: String(status), api_method: method },
    contexts: { api: {
      endpoint,
      method,
      status,
      response_message: responseMessage,
      request_id: safeRequestId,
      error_code: typeof error.code === 'string' ? redactText(error.code) : undefined,
    } },
  })
}
