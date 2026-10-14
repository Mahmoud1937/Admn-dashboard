# Providers and map

[README](../../README.md) · [API integration](../api-integration.md) · [Permissions](../authentication-and-permissions.md)

## Provider directory and details

[`ProvidersPage`](../../src/features/providers/pages/ProvidersPage.jsx) lists providers with server pagination, debounced search, status/date/category/specialist filters, and create or status actions gated by permission. [`providersService.js`](../../src/features/providers/services/providersService.js) sends those parameters to `GET /admin/providers`; create and update send multipart form data with bilingual names, category, optional specialist, contact fields, active state, and an optional logo. The provider lookup sends `SearchTrem` as spelled in source. Whether that spelling is accepted by the live API is not verified here.

[`ProviderDetailsPage`](../../src/features/providers/pages/ProviderDetailsPage.jsx) is shared by `/providers/new` and `/providers/:id`. It can present the main provider form and, for an existing provider, permission-filtered branches, services, and packages tabs. An edit request also checks `providers.update`. Route-level provider read permission alone does not expose every nested tab or action.

## Branches and provider services

The standalone [branches page](../../src/features/branches/pages/BranchesPage.jsx) renders the branch tab in read-only mode. The tab and its [service](../../src/features/branches/services/providerBranchesService.js) support provider-specific or all-provider lists, geographic filters, search, status, pagination, create/update, and activate/deactivate actions. The branch UI uses status values 0, 1, and 2 for all, active, and deactive. The service returns the response body unchanged while [the hooks](../../src/features/branches/hooks/useAllBranchesQuery.js) read top-level `items` and pagination fields; the actual response shape must be checked against the backend before assuming the list works.

[Provider services](../../src/features/providerServices/components/ProviderServicesTab.jsx) associate a provider with a catalog service and price, discount, special-offer, and active fields. [`providerServicesService.js`](../../src/features/providerServices/services/providerServicesService.js) uses a provider-scoped list, JSON create/update, a PATCH activation call, and a DELETE deactivation call. These are client request choices; backend effects are unverified.

## Packages

[`ProviderPackagesTab`](../../src/features/providerPackages/components/ProviderPackagesTab.jsx) lists paginated packages, displays price and discount information received from the API, and permission-gates create, edit, status, and delete controls. [The form](../../src/features/providerPackages/components/ProviderPackageFormModal.jsx) validates bilingual content, percentage and price, two images, and selected provider services, then converts values for [multipart create/update requests](../../src/features/providerPackages/services/providerPackagesService.js). On update, image fields are sent only when a new `File` is supplied. The detail request reads `data.data`; the list hook reads `data.data.items`. Successful mutations invalidate package Query keys. The actual backend price calculation and deletion semantics are not established by the front end.

## Map

[`ProviderMapPage`](../../src/features/provider-map/pages/ProviderMapPage.jsx) fetches provider/branch map data by provider category and can fetch client locations when the “Users” toggle is on. [`useProvidersMapQuery`](../../src/features/provider-map/hooks/useProvidersMapQuery.js) filters invalid Egypt coordinates, resolves governorates from local polygon data, and applies governorate and search filtering on the client. It builds branch markers and governorate/country bubbles. [`usecCientLocationsQuery`](../../src/features/provider-map/hooks/usecCientLocationsQuery.js) groups valid client coordinates into fixed 200-meter grid cells and aggregate bubbles. [`ProviderClusterMap`](../../src/features/provider-map/components/ProviderClusterMap.jsx) renders the Leaflet view. The presence or accuracy of live location data is backend-dependent.
