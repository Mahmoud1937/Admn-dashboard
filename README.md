# MediCard Admin Dashboard

A web-based administration panel for the **MediCard** medical services platform. It lets platform staff manage healthcare providers, their branches and services, provider categories, cities and governorates, medicines, offer sliders (banners), card pools, and static page content (Terms & Conditions, Refund Policy, Privacy Policy, Contact Us) — including an interactive geographic map of providers across the Egyptian governorates.

---

## Project Overview

This is a **single-page React application** built with Vite. All data is served by the MediCard ASP.NET backend (`https://medicard-api-v2.medicardeg.com/api/`), which the frontend talks to via an Axios instance that attaches a JWT bearer token to every request.

The application is fully bilingual (English / Arabic), with many entities (names, banners, and rich-text policies) maintained in both languages.

---

## Features

- **Dashboard** — placeholder landing overview for today's platform activity.
- **Providers** — list, search, filter, create, edit, and view healthcare providers, plus activate/deactivate toggling.
- **Provider Details** — add/edit form with category and specialist selection, hotline, phone, active flag, and logo upload. Includes nested tabs for managing:
  - **Branches** — per-provider branches with city and governorate relations.
  - **Provider Services** — services offered by a provider.
- **Provider Categories** — manage provider category entities.
- **Service Categories & Services** — manage service categories and the services that belong to them.
- **Specialists** — manage specialist entities.
- **Governorates & Cities** — manage the geographic hierarchy that provider branches link to.
- **Medicines** — CRUD for medicines with price, form, and image upload.
- **Card Pools** — create card pools (a range of `from`/`to` card numbers) and export them to an Excel file.
- **Offer Sliders** — manage banner sliders per provider, with separate English and Arabic images; view full images and update them on a detail page.
- **Provider Map** — an interactive responsive map (`react-leaflet`) visualizing providers by Egyptian governorate with three levels of clustering (country bubble → governorate bubbles → individual pins), filtering by category/governorate/search, and an optional client-locations layer.
- **Content Pages** — bilingual rich-text editors for:
  - Terms & Conditions
  - Refund Policy
  - Privacy Policy
  - Contact Us (phone, email, WhatsApp, and social links)

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Core | React 19, React DOM 19 |
| Build tool | Vite 8 + `@vitejs/plugin-react` |
| Language | JavaScript (JSX, ES modules) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`), `tailwind-scrollbar` |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| HTTP client | Axios |
| Forms | react-hook-form v7 + `@hookform/resolvers` |
| Validation | Zod v4 |
| Maps | Leaflet, react-leaflet v5, `react-leaflet-cluster` v4 |
| Icons | lucide-react, Font Awesome (`@fortawesome/react-fontawesome`) |
| Toasts | react-hot-toast |
| Linting | ESLint 10 (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) |

---

## Project Structure

```
admin-dashboard/
├── public/                        # Static assets (favicon.svg, icons.svg)
├── src/
│   ├── app/
│   │   ├── App.jsx                # Root component (QueryClient + Router providers)
│   │   ├── router.jsx             # All routes
│   │   └── queryClient.js         # Shared TanStack Query client
│   ├── assets/                    # Logos and static images
│   ├── features/                  # Feature-scoped modules (see below)
│   │   ├── providers/             # Providers CRUD + details (branches, services)
│   │   ├── provider-map/          # Interactive provider map
│   │   ├── offer-sliders/         # Banner sliders CRUD + details
│   │   ├── termsAndConditions/    # T&C editor (shared editor component)
│   │   ├── refundPolicy/          # Refund policy page
│   │   ├── privacyPolicy/         # Privacy policy page
│   │   ├── contactUs/             # Contact / social links editor
│   │   ├── branches/              # Per-provider branch management
│   │   ├── providerServices/      # Per-provider service management
│   │   ├── categoreis/            # Provider categories
│   │   ├── ServiceCategory/       # Service categories
│   │   ├── services-admin/        # Services
│   │   ├── specialists/           # Specialists
│   │   ├── governorates/          # Governorates CRUD
│   │   ├── cities/                # Cities CRUD
│   │   ├── Medicines/             # Medicines CRUD
│   │   ├── cardPool/              # Card pools + Excel export
│   │   └── dashboard/             # Dashboard page
│   ├── layout/
│   │   └── DashboardLayout.jsx    # Shell: sidebar + navbar + routed content
│   ├── sidebar/                   # Sidebar navigation
│   ├── navbar/                    # Top navigation + user menu
│   ├── shared/
│   │   ├── api/axiosInstance.js   # Axios instance (baseURL + JWT interceptor)
│   │   ├── components/            # Reusable UI (modals, tables, inputs, editor)
│   │   ├── constants/             # Server error message maps
│   │   ├── hooks/                 # useDebouncedValue, useServerPagination
│   │   ├── schema/                # Shared Zod validation fields
│   │   └── utils/                 # Error handling / input helpers
│   ├── utils/formatDate.js        # Date formatting helper
│   ├── index.css                  # Tailwind entry + theme + scrollbar styles
│   └── main.jsx                   # Application entry point
├── index.html
├── vite.config.js
├── eslint.config.js
├── vercel.json                    # SPA rewrite for Vercel hosting
└── package.json
```

### Feature module convention

Each `features/*` module follows a consistent pattern:

```
features/<name>/
├── components/    # Feature-specific React components
├── hooks/         # TanStack Query hooks (use<Feature>Query, use<Feature>Mutation)
├── pages/         # Page components wired into the router
├── schema/        # Zod validation schemas
├── service(s)/    # Axios API functions
└── (utils, data)  # Feature-specific helpers
```

---

## Routing

Routes are defined in `src/app/router.jsx` under a single layout route (`DashboardLayout`):

| Path | Page |
| --- | --- |
| `/` | Dashboard |
| `/providers` | Providers list |
| `/providers/new` | Create provider |
| `/providers/:id` | View / edit provider |
| `/provider-category` | Provider categories |
| `/service-category` | Service categories |
| `/services` | Services |
| `/medicines` | Medicines |
| `/specialist` | Specialists |
| `/governorates` | Governorates |
| `/cities` | Cities |
| `/card-pools` | Card pools |
| `/offer-sliders` | Offer sliders list |
| `/offer-sliders/:id` | Slider details / update |
| `/provider-map` | Provider map |
| `/terms-and-conditions` | Terms & Conditions |
| `/refund-policy` | Refund Policy |
| `/privacy-policy` | Privacy Policy |
| `/contact-us` | Contact Us |
| `*` | 404 Not Found |

The mapping between routes and the sidebar is maintained in `src/sidebar/navigation.js`.

---

## API Integration

All HTTP requests go through the shared Axios instance at `src/shared/api/axiosInstance.js`:

- **Base URL**: `https://medicard-api-v2.medicardeg.com/api/`
- A request interceptor attaches `Authorization: Bearer <token>` read from `localStorage` (`token` key).
- For development/testing, a **static JWT token is written to `localStorage` automatically** on import.

### Response envelope

The backend wraps responses in a standard envelope:

```json
{
  "httpStatusCode": 200,
  "succeeded": true,
  "message": "...",
  "data": { }
}
```

Feature hooks use TanStack Query and typically `select` the `data` field into the shape the UI expects (e.g. `{ en, ar, updatedAt }` for policy pages).

### API endpoints used (from `features/*/service(s)/`)

| Feature | Endpoint(s) |
| --- | --- |
| Providers | `/admin/providers`, `/admin/providers/{id}`, `/admin/providers/make-active/{id}` |
| Map data | `/MapAdmin/data`, `/MapAdmin/clients` |
| Sliders | `/SliderAdmin` |
| Medicines | `/MedicineAdmin/medicines` |
| Governorates | `/GovernoratesAdmin` |
| Cities | `/CityAdmin/cities` |
| Card pools | `/CardPoolAdmin`, `/CardPoolAdmin/{id}/export` |
| Terms & Conditions | `/TermsAndConditionsAdmin` |
| Refund Policy | `/RefundPolicyAdmin` |
| Privacy Policy | `/PrivacyPolicyAdmin` |
| Contact Us | `contactsUsService` (see `src/features/contactUs/services/`) |

Note: each feature's exact request/response contract is defined in its `service(s)` file.

---

## Authentication

Authentication is handled client-side via JWT:

- The token is stored in `localStorage` under the key `token`.
- The Axios request interceptor (in `src/shared/api/axiosInstance.js`) automatically attaches it as a `Bearer` token to every request.
- The current codebase ships with a **static development token** that is written to `localStorage` on load; there is no login flow implemented.

---

## Internationalization (i18n)

The application is **bilingual — English and Arabic** (RTL). This works on two levels:

1. **Data-level** — most managed entities store separate `en`/`ar` fields (e.g. names, banner images, policy descriptions).
2. **UI-level** — the rich-text editors render an `ar`/`en` language toggle and drive `dir="rtl"`/`dir="ltr"` rendering on blocks. Provider map popups render with `dir="rtl"` for Arabic content.

The rich-text editor (`src/features/termsAndConditions/components/Termsandconditionseditor.jsx`) is reused across the Terms & Conditions, Refund Policy, and Privacy Policy pages.

---

## Environment Variables

**There are no environment variables** used by the Vite app. The API base URL and the static auth token are hard-coded in `src/shared/api/axiosInstance.js`.

> This is intentional for the current build. If you need to make the backend URL configurable, add a `.env` file with a `VITE_*` variable and read it via `import.meta.env`.

---

## Installation

**Prerequisites**

- Node.js 22.x (see `engines` in `package.json`)

**Setup**

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`).

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Build a production bundle into `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint across the project |

---

## Architecture / Application Flow

1. **Entry** — `src/main.jsx` mounts the app inside `<StrictMode>` with a global `<Toaster>` from `react-hot-toast`.
2. **Providers** — `src/app/App.jsx` wraps the router with a `TanStack QueryClientProvider`.
3. **Routing & Layout** — `createBrowserRouter` renders `DashboardLayout`, which composes the `Sidebar` and `Navbar` around an `<Outlet />` for nested routes.
4. **Data layer** — each feature exposes TanStack Query hooks (`use<Feature>Query` for reads, `use<Feature>Mutation` for writes) that call Axios service functions.
5. **Forms** — `react-hook-form` + `zodResolver` validate client input via Zod schemas in `features/*/schema`. Server (field-level) errors are mapped back onto the form with `applyServerErrors` / `extractErrorMessage` / `handleMutationError`.
6. **Toasts** — mutations surface success/failure through `react-hot-toast`.

### Reusable shared components

`src/shared/components/` contains building blocks used across features:

- `ScrollableTable`, `Pagination`, `TableEmptyState`, `RowActions` — list/table scaffolding
- `ConfirmDeleteModal`, `FormModalShell`, `FormActions`, `TextField` — modal/forms
- `ImageUploadField`, `AvatarImage` — image picking/preview (click + drag & drop)
- `PagePlaceholder` — placeholder for not-yet-implemented routes
- `BilingualRichTextEditor` / `Termsandconditionseditor` — rich-text editing

---

## Provider Map Details

The interactive map (`src/features/provider-map/`) is the most complex feature:

- Uses **Leaflet + react-leaflet** with an OpenStreetMap tile layer.
- **Three-level clustering** controlled by zoom:
  - Zoomed out → a single **country bubble** for all of Egypt.
  - Medium zoom → **governorate bubbles** (niceCount circles placed at each governorate center, with collision/declutter handling).
  - High zoom → **individual provider pins** grouped by `MarkerClusterGroup`.
- Governorate affiliation is **resolved from coordinates** at runtime (point-in-polygon against a simplified `Egyptgovernorates.json` GeoJSON) rather than trusting the backend label.
- Custom `divIcon` markers with color-coded governorate borders, cluster hover tooltips listing providers, and click-to-fly zoom behavior.
- Optional **client locations** layer toggled from the page UI.
- Provider/category colors are defined in `CategoryTabs.jsx`.

---

## Build & Deployment

**Build locally:**

```bash
npm run build
```

The output goes to `dist/`. `eslint.config.js` ignores `dist/`, and `.gitignore` excludes `node_modules`, `dist`, and common editor/log files.

**Deployment**

The project includes `vercel.json` configured with an SPA rewrite that routes all paths back to `/index.html` (required for React Router's client-side routing). Deploy the root of the repository to **Vercel** (or any static host that serves the `dist/` output).

---

## Development Notes

- **Windows / PowerShell**: when running multiple commands, use `;` (or `if ($?) { ... }`) rather than `&&`, which PowerShell 5.1 does not support.
- **ES modules**: the project uses `"type": "module"` — do not introduce CommonJS-style `require()`.
- **Rich-text editor quirks**:
  - The code deliberately avoids deprecated `document.execCommand` for lists, blocks, headings, and text colors where feasible — these use manual DOM range manipulation.
  - HTML emitted to the backend is cleaned of browser-injected attributes (`class`, `dir`, `data-spread`, and direction styles) so saved content stays clean and reloads correctly.
  - The backend may double-escape HTML entities (`<p>` → `&lt;p&gt;`); this is a server-side concern.
- **Auth token**: the hard-coded static token in `axiosInstance.js` is for development/test only and is committed for that purpose. Rotate/remove it before production and implement a real login flow.
- **Feature consistency**: when adding a new CRUD module, follow the established `features/<name>/` convention (components, hooks, pages, schema, service) and reuse the shared form/table components.

---

## License

This is a private, internal project (`private: true` in `package.json`). No license is specified.
