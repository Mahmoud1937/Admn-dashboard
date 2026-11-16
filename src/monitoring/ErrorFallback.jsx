import { useEffect, useRef } from 'react'
import { useRouteError } from 'react-router-dom'
import { reportRouteError } from './sentry'

export default function ErrorFallback({ error, componentStack }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm" role="alert">
        <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-3 text-slate-600">Please reload the page and try again. If the problem continues, contact support.</p>
        <button type="button" className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white" onClick={() => window.location.reload()}>
          Reload page
        </button>
        {import.meta.env.DEV && error && (
          <pre className="mt-6 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-100 p-4 text-xs text-slate-800">
            {error.stack || String(error)}{componentStack ? `\n\nComponent stack:\n${componentStack}` : ''}
          </pre>
        )}
      </div>
    </main>
  )
}

export function RouteErrorElement() {
  const error = useRouteError()
  const lastReported = useRef(null)

  useEffect(() => {
    if (lastReported.current === error) return
    lastReported.current = error
    reportRouteError(error)
  }, [error])

  return <ErrorFallback error={error} />
}
