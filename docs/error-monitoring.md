# Error monitoring

The dashboard sends JavaScript, React, route, handled query/mutation, and final API failures to Sentry. Development errors remain visible in the browser console and the fallback UI. Production users see a generic fallback; the Sentry event remains after a toast disappears.

## Configure Sentry

Create a **React** project in Sentry and set these values in the deployment build environment:

| Variable | Purpose |
| --- | --- |
| `VITE_SENTRY_DSN` | Public browser DSN. Required for production builds. Can also be set locally to send development events. |
| `SENTRY_AUTH_TOKEN` | Private build token with `org:ci` permission for release and source map upload. Never prefix with `VITE_`. |
| `SENTRY_ORG` | Sentry organization slug. |
| `SENTRY_PROJECT` | Sentry project slug. |
| `SENTRY_RELEASE` | Optional immutable release ID. Defaults to `VERCEL_GIT_COMMIT_SHA`, then the full local Git commit SHA. |

Set the same `SENTRY_RELEASE` for the whole deployment, including any separate backend project if you want cross-project release comparisons. Do not reuse a release ID for different bundles. The runtime release and uploaded source maps use the same value from `vite.config.js`.

`npm run build` fails when the production DSN or source map upload credentials are missing. For an intentional **local-only** build without monitoring, use `SENTRY_SKIP_MONITORING=1`; that build has no source maps and must not be deployed as a monitored release. Never put `SENTRY_AUTH_TOKEN` in `.env` files that are committed or in a `VITE_` variable. `.env.sentry-build-plugin` is ignored if you choose to use it locally.

Vite generates hidden maps for a configured production build. The Sentry Vite plugin uploads them with debug IDs, deletes `dist/**/*.map`, and fails the build if upload fails. Deploy only the resulting `dist/` after a successful build. Confirm that no `.map` file is present in deployed assets and that the corresponding release's artifact bundle appears in Sentry. Source maps resolve the original file, line, column, and function where the browser stack provides that information; browsers and minifiers cannot always supply a function name.

## Investigate an error

Open Sentry **Issues** or **Discover**, filter by `environment` (`development` or `production`) and `release`, then open an event. Inspect the exception stack and React component stack, route tag, action/navigation breadcrumbs, `api` context, and `request_id` when present. The API fingerprint groups by sanitized endpoint, method, and status. The user ID is a random browser installation ID, so Sentry's affected-user count represents browser installations rather than identified employees.

API failures are reported by the shared Axios instance **after** its existing 401/403 token recovery finishes. A recovered 401/403 is not a final failure. Final 401/403, 500, and network failures are reported. Canceled requests are ignored. HTTP 200 responses with an explicit `succeeded: false` or `success: false` flag are also reported without changing the response delivered to callers. A toast alone is not an exception and cannot supply the original stack.

Telemetry includes the request method, sanitized endpoint, status, safe response message, error code, and a response request ID when available. It excludes query strings, request and response bodies, Axios headers, tokens, and arbitrary Sentry extras. URL path segments that look like IDs or email addresses are replaced. The client redacts common credentials, email addresses, and phone-like numbers in messages. Backend error messages must also be reviewed to ensure they never contain patient, client, or employee data; client-side pattern matching cannot identify every possible personal detail. Set the Sentry project to **Prevent Storing IP Addresses** and review its Data Scrubbing settings. Session Replay, request body capture, console breadcrumbs, DOM selector breadcrumbs, and performance tracing are not enabled.

## Backend correlation

The backend source is not in this repository. Its owner should:

1. Generate or accept a request ID at the API edge, put it in every response as `X-Request-ID`, and log it with every server exception. Expose `X-Request-ID` through CORS `Access-Control-Expose-Headers` so browser JavaScript can read it. `X-Correlation-ID` is also supported by the frontend.
2. Add Sentry's server SDK and structured logs with timestamp, environment, release, request ID, route template, HTTP method/status, exception type, and server stack. Scrub secrets and personal data before sending logs or Sentry events. Avoid logging request/response bodies by default.
3. Return safe public error messages and the request ID. Never return an internal stack trace. Retain the same ID across downstream services and include it in their logs.

The frontend reads a response ID without adding a request header; adding a custom header would change CORS/preflight and existing request behavior. Until the backend exposes that header, frontend events cannot be reliably joined to server logs.

## Production verification checklist

`npm run test:monitoring:browser` runs local Chrome/Edge probes against a mock Sentry ingest endpoint. It checks runtime and render errors, unhandled rejections, network/401/403/500 failures, HTTP 200 failure flags, expiring toasts, event context/privacy, and successful 401/403 refresh retries. It requires Chrome or Edge (or `CHROME_PATH`). It does **not** test delivery to a real Sentry project or uploaded production source maps.

Run these on a staging deployment with a real Sentry DSN and a successful source map upload. For each event, check the Sentry dashboard for the expected environment and release, original source file/line/column, stack, route, and relevant API context. Do not treat a local console message as dashboard verification.

| Probe | Expected evidence |
| --- | --- |
| JavaScript runtime throw | Global handler event with original stack. |
| React render throw | Sentry event with component stack and safe fallback. |
| Unhandled promise rejection | Global rejection event. |
| Failed Axios request | API event with method, sanitized endpoint, status or `network`. |
| Final 401 and 403 | API events after existing auth recovery settles. |
| 500 response | API event with status and request ID if the backend sent one. |
| Dismissing/expiring error toast | The related API event remains in Sentry. |
| Production source maps | Event shows original source file, line and column; deployed `dist/` contains no `.map` files. |

Browser extensions, disabled JavaScript, blocked Sentry network requests, browser termination before delivery, and errors deliberately swallowed by code outside the shared monitoring paths cannot be guaranteed to arrive. A Sentry project and its credentials are required to verify delivery, artifact upload, and dashboard symbolication.
