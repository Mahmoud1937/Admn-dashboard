/* eslint-disable react-refresh/only-export-components */
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { Toaster, toast } from 'react-hot-toast'
import axiosInstance, { REFRESH_TOKEN_KEY, setToken } from '../../src/shared/api/axiosInstance'
import { initMonitoring } from '../../src/monitoring/sentry'

initMonitoring()
axiosInstance.defaults.baseURL = `http://127.0.0.1:${new URLSearchParams(location.search).get('apiPort')}/api/`

const root = createRoot(document.getElementById('root'))
function Crash() { throw new Error('monitoring render probe') }
root.render(createElement(Toaster, { position: 'top-right' }))

window.runMonitoringProbe = async (kind) => {
  const action = document.createElement('button')
  action.textContent = 'Probe action'
  document.body.append(action)
  action.click()
  action.remove()
  if (kind === 'runtime') {
    setTimeout(() => { throw new Error('monitoring runtime probe') }, 0)
  } else if (kind === 'promise') {
    Promise.reject(new Error('monitoring promise probe'))
  } else if (kind === 'render') {
    root.render(createElement(Sentry.ErrorBoundary, {
      fallback: createElement('div', null, 'Safe fallback'),
    }, createElement(Crash)))
  } else if (kind.startsWith('recover-')) {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))
    localStorage.setItem(REFRESH_TOKEN_KEY, 'test-refresh-token')
    setToken(`header.${payload}.signature`, new Date().toISOString())
    const response = await axiosInstance.get(`probe-${kind}`)
    document.body.dataset.recovered = String(response.status === 200)
  } else if (kind === 'refresh-400') {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))
    localStorage.setItem(REFRESH_TOKEN_KEY, 'test-refresh-token')
    setToken(`header.${payload}.signature`, new Date().toISOString())
    try { await axiosInstance.get('probe-refresh-400') } catch { /* Expected terminal refresh failure. */ }
  } else {
    try {
      const response = await axiosInstance.get(`authadmin/login/probe-${kind}?access_token=secret-value`)
      if (response.data?.succeeded === false) toast.error('Unexpected Error', { duration: 40 })
    } catch {
      if (kind === '500') toast.error('Unexpected Error', { duration: 40 })
    }
  }
  return true
}

const automaticKind = new URLSearchParams(location.search).get('kind')
if (automaticKind) {
  setTimeout(async () => {
    await window.runMonitoringProbe(automaticKind)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    await Sentry.flush(2000)
    document.body.dataset.probeDone = automaticKind
    document.body.dataset.toastVisible = String(document.body.textContent.includes('Unexpected Error'))
  }, 100)
}
