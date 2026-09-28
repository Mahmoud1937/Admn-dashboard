# MediCard Admin Dashboard

The MediCard Admin Dashboard is a React/Vite administration portal for managing healthcare providers, clients, tickets, invoices, card operations, content, and supporting reference data.

The application uses the MediCard ASP.NET API:

```text
https://medicard-api-v2.medicardeg.com/api/
```

It is bilingual by design. API entities commonly expose English and Arabic names, and the UI preserves the appropriate text direction for both languages.

## Features

- Dashboard shell with responsive sidebar and navbar
- Admin login with JWT authentication
- Persistent access and refresh tokens in `localStorage`
- Automatic access-token refresh through proactive scheduling and 401 fallback
- Provider CRUD, details, branches, services, activation, image upload, and map views
- Clients list, client details, family members, invoices, and order history
- Support tickets with filters, ticket details, timeline, create, and update flows
- Ticket types and subscription/plan types administration
- Provider categories, service categories, services, specialists, governorates, and cities
- Medicines administration with image upload
- Card pools, sold cards, missed cards, activation, and exports
- Offer sliders with bilingual images and detail/update views
- Provider map with provider and client locations
- Terms & Conditions, Refund Policy, Privacy Policy, and Contact Us editors
- Shared loading, empty, error, pagination, modal, and form components

## Technology

| Area | Technology |
| --- | --- |
| UI | React 19, React DOM 19 |
| Build tool | Vite 8, `@vitejs/plugin-react` |
| Styling | Tailwind CSS v4, `@tailwindcss/vite` |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| HTTP | Axios |
| Forms | React Hook Form, `@hookform/resolvers` |
| Validation | Zod v4 |
| Maps | Leaflet, React Leaflet, React Leaflet Cluster |
| Icons | Lucide React and Font Awesome |
| Notifications | React Hot Toast |

## Requirements

- Node.js 22.x
- npm

## Getting started

```bash
npm install
npm run dev
```

Vite normally serves the app at `http://localhost:5173`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

## Routes

The route tree is defined in `src/app/router.jsx`. Page components are loaded lazily and protected routes are rendered through `ProtectedRoute` and `DashboardLayout`.

| Path | Description |
| --- | --- |
| `/login` | Admin login |
| `/` | Dashboard |
| `/providers` | Providers |
| `/providers/new` | Create provider |
| `/providers/:id` | Provider details/edit |
| `/clients` | Clients |
| `/clients/:clientId` | Client details |
| `/invoices` | Invoices |
| `/support-tickets` | Tickets |
| `/ticket-types` | Ticket types |
| `/plan-types` | Subscription/plan types |
| `/provider-map` | Provider map |
| `/provider-category` | Provider categories |
| `/service-category` | Service categories |
| `/services` | Services |
| `/medicines` | Medicines |
| `/speialist` | Specialists (legacy route spelling) |
| `/governorates` | Governorates |
| `/cities` | Cities |
| `/card-activation` | Card activation |
| `/card-pools` | Card pools |
| `/card-pool/sold-cards` | Sold cards by pool |
| `/sold-card` | Sold card records |
| `/card-missed` | Missed cards |
| `/offer-sliders` | Offer sliders |
| `/offer-sliders/:id` | Slider details/edit |
| `/terms-and-conditions` | Terms & Conditions |
| `/refund-policy` | Refund Policy |
| `/privacy-policy` | Privacy Policy |
| `/contact-us` | Contact Us |
| `*` | Not Found |

## Project structure

```text
src/
  app/                    App providers, router, and query client
  assets/                 Logos and static assets
  features/               Feature modules (pages, components, hooks, schemas, services)
  layout/                 Dashboard layout shell
  navbar/                 Navbar and user menu
  sidebar/                Sidebar navigation
  shared/
    api/                  Axios instance and authentication interceptors
    components/           Reusable UI components
    hooks/                Shared hooks
    schema/               Shared validation schemas
    utils/                Error, JWT, formatting, and form utilities
  utils/                  Application-level utilities
  main.jsx                Application entry point
```

Feature modules generally follow this convention:

```text
features/<feature>/
  components/
  hooks/
  pages/
  schema/
  services/       # or service/
  utils/          # optional
```

## Authentication

Authentication is implemented in:

- `src/features/auth/context/Authcontext.jsx`
- `src/features/auth/hooks/useAuthMutations.js`
- `src/features/auth/services/Authservice.js`
- `src/shared/api/axiosInstance.js`
- `src/shared/components/Protectedroute.jsx`

Successful login stores the access token under `token` and the refresh token under `refreshToken` in `localStorage`. The login page uses the existing JWT-based authentication flow and does not use `sessionStorage`.

Authenticated requests receive a `Bearer` token from the Axios request interceptor. When an access token expires or an API returns `401`, the client calls:

```text
POST /api/AuthAdmin/refresh-token
```

with:

```json
{
  "refreshToken": "stored-refresh-token"
}
```

The refresh response is read from `data.token` and `data.refreshToken`. The failed request is retried once with the new access token. Concurrent refresh attempts share one in-flight promise, and a request that returns 401 after another request has already refreshed the token is retried with the current stored token instead of starting another refresh.

If refresh fails, the retry still returns 401, or the refresh-attempt circuit breaker is exceeded, both tokens are cleared and the user is redirected to `/login`. `ProtectedRoute` waits during startup authentication initialization and blocks direct access to protected routes when no valid admin JWT is available.

For development-only authentication diagnostics, set this in the browser console:

```js
localStorage.setItem("debugAuth", "1");
```

Remove it when finished:

```js
localStorage.removeItem("debugAuth");
```

## API integration

Feature service modules call the shared Axios instance at `src/shared/api/axiosInstance.js`. The API commonly returns an envelope like:

```json
{
  "httpStatusCode": 200,
  "errors": null,
  "succeeded": true,
  "message": "...",
  "data": {}
}
```

TanStack Query hooks provide list/detail data, caching, loading states, refetching, and mutation invalidation. Form mutations use the shared server-error utilities to map field-specific backend messages back to the relevant input.

The API base URL is currently defined in `axiosInstance.js`; no Vite environment variables are required by the current project.

## Validation and forms

Forms use React Hook Form with Zod schemas where applicable. Shared components provide consistent field styling, error messages, pagination, table scrolling, image loading, modal behavior, and empty/error states.

## Deployment

Build the application with:

```bash
npm run build
```

The production output is written to `dist/`. `vercel.json` contains an SPA rewrite to `index.html`, which allows React Router routes to work when accessed directly on Vercel or another static host configured with an equivalent fallback.

## Development notes

- The project uses ES modules (`"type": "module"`); use `import`/`export` rather than CommonJS `require`.
- Keep API calls inside feature service modules and expose them through feature hooks.
- Reuse shared components and validation/error helpers when adding a new feature.
- Preserve bilingual data and set `dir="rtl"` only on Arabic content rather than changing the direction of the entire page.
- Do not commit real credentials or tokens.

## License

This is a private internal project. No open-source license is specified.
