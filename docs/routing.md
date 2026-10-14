# Routing and layouts

[README](../README.md) · [Authentication](authentication-and-permissions.md)

The [router](../src/app/router.jsx) uses `createBrowserRouter`. Most page components are loaded with React `lazy` and rendered beneath the [`App` Suspense boundary](../src/app/App.jsx). The notifications page is imported directly. [`DashboardLayout`](../src/layout/DashboardLayout.jsx) supplies the sidebar, navbar, and an `Outlet` for protected pages.

## Route boundaries

- `/login` is public. The login page redirects an already authenticated user to `/` or `/change-password`.
- `/change-password` is outside the dashboard layout. Its page redirects unauthenticated users to `/login` and users without the password-change flag to `/`.
- The `/` route wraps dashboard children in [`ProtectedRoute`](../src/shared/components/Protectedroute.jsx). It waits for authentication and permission loading, redirects an invalid session to `/login`, renders a retryable permission-loading error, and redirects a user flagged for password change.
- Most dashboard pages are wrapped in [`PermissionRoute`](../src/features/auth/components/PermissionRoute.jsx), which renders [`AccessDeniedPage`](../src/shared/components/AccessDeniedPage.jsx) when the required code is absent. The nested `*` route renders a not-found page.
- [Sidebar navigation](../src/sidebar/navigation.js) separately filters links by permission. Hiding a link does not replace route checks or backend authorization.

## Route inventory

The table describes the permission wrapper in source, not a claim about server-side access. The authoritative code strings are in [`permissionCodes.js`](../src/features/auth/constants/permissionCodes.js).

| Path | Page | Route permission |
| --- | --- | --- |
| `/` | Dashboard | `dashboard.read` |
| `/providers` | Providers | `providers.read` |
| `/providers/new` | Provider creation | `providers.create` |
| `/providers/:id` | Provider details | `providers.read` |
| `/branches` | Branches | `provider_branches.read` |
| `/provider-map` | Provider map | `map.read` |
| `/provider-category` | Provider categories | `provider_categories.read` |
| `/service-category` | Service categories | `service_categories.read` |
| `/services` | Services | `services.read` |
| `/medicines` | Medicines | `medicines.read` |
| `/speialist` | Specialists | `specialists.read` |
| `/governorates` | Governorates | `governorates.read` |
| `/cities` | Cities | `cities.read` |
| `/clients` | Clients | `clients.read` |
| `/clients/:clientId` | Client details | `clients.read` |
| `/invoices` | Invoices | `invoices.read` |
| `/support-tickets` | Tickets | `tickets.read` |
| `/ticket-types` | Ticket types | `ticket_types.read` |
| `/plan-types` | Subscription types | `plan_types.read` |
| `/card-activation` | Card activation listing | `cards.read` |
| `/card-pools` | Card pools | `card_pools.read` |
| `/card-pool/sold-cards` | Sold cards in a pool | `card_sales.read` |
| `/sold-card` | Sold card records | `card_sales.read` |
| `/card-missed` | Missed card records | `missed_cards.read` |
| `/offer-sliders` | Offer sliders | `sliders.read` |
| `/offer-sliders/:id` | Slider details | `sliders.read` |
| `/employees` | Employees | `employees.read` |
| `/notifications` | Marketing notifications | `notification_marketing.read` |
| `/terms-and-conditions` | Terms and conditions | `terms_and_conditions.read` |
| `/refund-policy` | Refund policy | `refund_policy.read` |
| `/privacy-policy` | Privacy policy | `privacy_policy.read` |
| `/contact-us` | Contact information | `contact_us.read` |

`/speialist` is the route's current spelling. Provider branches, services, and packages also appear as permission-filtered tabs within provider details; their tab behavior is described in [providers and map](features/providers-and-map.md). The sidebar is a subset of the route inventory, so a valid route need not have its own sidebar entry.
