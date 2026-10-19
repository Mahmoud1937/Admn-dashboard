# Development setup and deployment

[README](../README.md) · [Architecture](architecture.md) · [API integration](api-integration.md)

## Requirements and commands

[`package.json`](../package.json) declares Node.js `22.x` and uses npm with a committed [lockfile](../package-lock.json).

```bash
npm ci
npm run dev
```

Vite normally serves the local app at `http://localhost:5173` unless the port is occupied or overridden. An API environment and an admin account are needed to use authenticated features; this repository does not provide those credentials.

| Command | Checked-in script |
| --- | --- |
| `npm run dev` | `vite` |
| `npm run build` | `vite build` |
| `npm run preview` | `vite preview` |
| `npm run lint` | `eslint .` |

There is no `test` script. The build output is `dist/`, which [`eslint.config.js`](../eslint.config.js) ignores and [`.gitignore`](../.gitignore) excludes from Git. The repository contains a [Prettier configuration](../.prettierrc), but no formatting script is declared.

## Environment configuration

[`src/shared/api/axiosInstance.js`](../src/shared/api/axiosInstance.js) sets the API base URL directly in source. A source search found no project-specific `import.meta.env` variable or checked-in `.env` file. `import.meta.env.DEV` is used only for optional protected-route diagnostics in [`Protectedroute.jsx`](../src/shared/components/Protectedroute.jsx). Therefore, there are **no required environment variable names to set for the current code**. Changing the API target would require a code or deployment change outside the scope of this documentation.

The front end stores its access token in browser `localStorage`; never put real credentials or token values in documentation, commits, or screenshots. [Authentication and permissions](authentication-and-permissions.md) describes the lifecycle.

## Build and hosting

`npm run build` creates static assets in `dist/`. `npm run preview` serves that build locally for inspection. [`vercel.json`](../vercel.json) rewrites paths to `/index.html` so direct navigation to React Router URLs works on Vercel. Another static host needs an equivalent SPA fallback. The repository does not define a CI pipeline, deployment environment variables, release process, or server configuration beyond this rewrite; obtain those details from the deployment owners.

The [lint configuration](../eslint.config.js) applies recommended JavaScript, React Hooks, and Vite React Refresh rules to `.js` and `.jsx` files. Documentation-only changes do not require a build to establish their contents; a build is a separate application validation step.
