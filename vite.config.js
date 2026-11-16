import { execFileSync } from 'node:child_process'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'

function sourceRevision() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {
    return 'local'
  }
}

export default defineConfig(({ command, mode }) => {
  const publicEnv = loadEnv(mode, process.cwd(), 'VITE_')
  const release = process.env.SENTRY_RELEASE ||
    process.env.VERCEL_GIT_COMMIT_SHA || sourceRevision()
  const hasSentryDsn = Boolean(publicEnv.VITE_SENTRY_DSN)
  const hasUploadCredentials = Boolean(
    process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
  )

  if (command === 'build' && mode === 'production' && !hasSentryDsn &&
      process.env.SENTRY_SKIP_MONITORING !== '1') {
    throw new Error('VITE_SENTRY_DSN is required for production builds. Set SENTRY_SKIP_MONITORING=1 only for an intentional local build without monitoring.')
  }
  if (command === 'build' && hasSentryDsn && !hasUploadCredentials) {
    throw new Error('Sentry is enabled, but SENTRY_AUTH_TOKEN, SENTRY_ORG, and SENTRY_PROJECT are required to upload private source maps.')
  }

  return {
    define: { __APP_RELEASE__: JSON.stringify(release) },
    plugins: [
      react(),
      tailwindcss(),
      ...(command === 'build' && hasSentryDsn ? [sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: { name: release },
        sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
        errorHandler: (error) => { throw error },
        telemetry: false,
      })] : []),
    ],
    build: { sourcemap: command === 'build' && hasSentryDsn ? 'hidden' : false },
    esbuild: { drop: ['console', 'debugger'] },
  }
})
