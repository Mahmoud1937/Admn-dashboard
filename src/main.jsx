import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "react-hot-toast";
import * as Sentry from '@sentry/react'

import './index.css'
import App from './app/App.jsx'
import ErrorFallback from './monitoring/ErrorFallback.jsx'
import { initMonitoring } from './monitoring/sentry.js'

initMonitoring()

createRoot(document.getElementById('root'), {
  onUncaughtError: Sentry.reactErrorHandler((error, info) => {
    if (import.meta.env.DEV) console.error('[uncaught React error]', error, info.componentStack)
  }),
  onRecoverableError: Sentry.reactErrorHandler((error, info) => {
    if (import.meta.env.DEV) console.error('[recoverable React error]', error, info.componentStack)
  }),
}).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
      <App />
      <Toaster position="top-right" />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
