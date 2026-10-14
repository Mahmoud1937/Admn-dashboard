# MediCard Admin Dashboard

A React and Vite administration portal for providers, clients, invoices, tickets, card operations, staff, notifications, reference data, and site content. The interface contains English and Arabic fields; individual Arabic content is displayed with right-to-left direction where needed.

## Start locally

Use Node.js 22.x and npm.

```bash
npm ci
npm run dev
```

The API URL is currently defined in `src/shared/api/axiosInstance.js`. No project-specific Vite environment variable is referenced in the source. See [development setup](docs/development-setup.md) before connecting to an environment.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the static app into `dist/` |
| `npm run preview` | Preview a production build locally |
| `npm run lint` | Run ESLint |

The repository has no test script.

## Documentation

- [Architecture and project structure](docs/architecture.md)
- [Development setup and deployment](docs/development-setup.md)
- [Routes and layouts](docs/routing.md)
- [Authentication and permissions](docs/authentication-and-permissions.md)
- [API integration and endpoint inventory](docs/api-integration.md)
- [Forms and UI states](docs/forms-and-ui-states.md)
- [Providers and map](docs/features/providers-and-map.md)
- [Clients and operations](docs/features/clients-and-operations.md)
- [Staff and notifications](docs/features/staff-and-notifications.md)
- [Catalog and content](docs/features/catalog-and-content.md)

These guides describe the checked-in front-end implementation. An endpoint or response shape shown in client code does not, by itself, verify the live backend contract.
