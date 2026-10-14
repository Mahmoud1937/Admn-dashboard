# API integration and client request inventory

[README](../README.md) · [Authentication](authentication-and-permissions.md) · [Forms and UI states](forms-and-ui-states.md)

## Scope and HTTP client

This is an inventory of requests **verified in front-end source**, not a validated OpenAPI specification. Paths, methods, parameters, and fields below describe what the browser code sends or reads. Live backend acceptance, complete response schemas, side effects, and authorization need backend or runtime verification.

[`axiosInstance.js`](../src/shared/api/axiosInstance.js) creates one Axios instance with base URL `https://medicard-api-v2.medicardeg.com/api/` and default `Content-Type: application/json`. Feature services import it. A request interceptor attaches a stored bearer token and blocks certain unauthenticated or forced-password-change requests. A response interceptor handles HTTP 401 refresh and retry; it does not unwrap every response or globally reject `succeeded: false`. [Authentication](authentication-and-permissions.md) gives the full session flow.

Services usually receive Axios `response.data`, which may be an application envelope. They differ in what they return:

| Observed client expectation | Examples |
| --- | --- |
| Return the envelope and let a hook read `data.items` | [Providers](../src/features/providers/services/providersService.js) and [provider packages](../src/features/providerPackages/services/providerPackagesService.js) return the response body; their hooks read nested `data.items`. |
| Unwrap `response.data.data` in the service | [Employees](../src/features/employees/services/employeesService.js), [card pools](../src/features/cardPool/services/cardPoolService.js), and [invoices](../src/features/invoices/services/invoicesService.js) return inner data for lists. |
| Require an application success flag | [Permission catalog](../src/features/employees/permissions/services/permissionsService.js), [map](../src/features/provider-map/services/ProviderMapService.js), and some update services throw when `succeeded` is false. |
| Assume a different or uncertain shape | [Branch hooks](../src/features/branches/hooks/useBranchesQuery.js) read top-level `items` from a service that returns the response body unchanged. The live shape is unverified. |

Where list data is read as a paginated object, the observed fields are `items`, `pageNumber`, `pageSize`, `totalCount`, and `totalPages`. This is a **front-end expectation**, not a guarantee for all endpoints. [`useClientsQuery`](../src/features/clients/hooks/useClientsQuery.js) recalculates total pages from count and page size. [`useServerPagination`](../src/shared/hooks/useServerPagination.js) starts at page 1 with size 20 unless overridden, resets page on a reset key, and leaves filter construction to each feature. Several list hooks use TanStack Query `placeholderData` to retain previous data during pagination. Query keys, invalidation, and enabled conditions are owned by each feature hook; the [root Query client](../src/app/queryClient.js) has no custom defaults.

Other response fields explicitly read by the client include login `token`/`accessToken`, `refreshToken`, `isNeedChangePassword`, and `permissionCodes`/`permissions`; employee `permissionIds`; permission catalog `id` and `code`; map `providers` and `governorates`; ticket detail `ticketTimelines`; and provider package `packageId`, names, prices, discount, service count, and active state. These are partial client projections, not complete response schemas.

## Authentication and staff

Sources: [auth service](../src/features/auth/services/Authservice.js), [Axios refresh](../src/shared/api/axiosInstance.js), [employee service](../src/features/employees/services/employeesService.js), [permission service](../src/features/employees/permissions/services/permissionsService.js).

| Method | Path relative to `/api/` | Parameters or body sent by client |
| --- | --- | --- |
| POST | `AuthAdmin/login` | `email`, `password` |
| POST | `AuthAdmin/refresh-token` | `refreshToken`; sent with base Axios, outside the shared interceptors |
| POST | `AuthAdmin/change-password` | `currentPassword`, `newPassword`, `confirmNewPassword` |
| POST | `AuthAdmin/logout` | No explicit body |
| POST | `/AuthAdmin/register` | `firstName`, `lastName`, `email`, `phoneNumber`, numeric `employeeMemberId` |
| PATCH | `AuthAdmin/employees/{employeeId}/reset-password` | No explicit body |
| GET | `/EmployeeAdmin` | `PageNumber`, `PageSize`, optional `SearchTerm`, `EmployeeGroupId` |
| GET | `/EmployeeAdmin/{employeeId}` | Path ID |
| PUT | `/EmployeeAdmin/{employeeId}` | `firstName`, `lastName`, `email`, `phoneNumber`, numeric `employeeGroupId` |
| PATCH | `/EmployeeAdmin/{employeeId}/toggle-active` | No explicit body |
| GET | `PermissionAdmin` | No explicit parameters; client expects catalog entries with `id` and `code` |
| PUT | `PermissionAdmin/employees/{employeeId}` | `permissionIds` array |
| GET | `/AdminLookup/employee-groups` | `SearchTerm`, `PageNumber`, optional `PageSize` |

Login reads an outer `succeeded` or `success` and nested or fallback token fields as described in [authentication](authentication-and-permissions.md). The employee list service returns inner `data` after checking `succeeded`; registration checks `success`. Those differences are retained in the inventory because the code does not establish one uniform response contract.

## Providers, branches, services, and packages

Sources: [providers](../src/features/providers/services/providersService.js), [branches](../src/features/branches/services/providerBranchesService.js), [provider services](../src/features/providerServices/services/providerServicesService.js), [packages](../src/features/providerPackages/services/providerPackagesService.js).

| Method | Path relative to `/api/` | Parameters or body sent by client |
| --- | --- | --- |
| GET | `/admin/providers` | `PageNumber`, `PageSize`, `SearchTerm`, `Search`, `Status`, `FromDate`, `ToDate`, `CategoryId`, `SpecialistId` |
| GET | `/admin/providers/{id}` | Path ID |
| POST, PUT | `/admin/providers`; `/admin/providers/{id}` | Multipart `ProviderCategoryId`, optional `SpecialistId`, `ArName`, `EnName`, `HotLine`, `PhoneNumber`, `IsActive`, `Landline`, optional `Logo` |
| DELETE | `/admin/providers/{id}` | Path ID |
| PATCH | `/admin/providers/make-active/{id}` | Path ID |
| GET | `/AdminLookup/provider` | `PageNumber`, `PageSize`, `SearchTrem` (source spelling) |
| GET | `/ProviderBranchesAdmin` | Optional `ProviderId`, `GovernorateId`, `CityId`, `Search`, `Status`, `PageNumber`, `PageSize` |
| GET | `AdminLookup/provider-branches` | Optional `ProviderId`, `SearchTerm`, `PageNumber`, `PageSize` |
| POST, PUT | `/ProviderBranchesAdmin/provider-branches`; `/ProviderBranchesAdmin/provider-branches/{id}` | JSON `providerId`, `governorateId`, `cityId`, `email`, `branchName`, `mapUrl`, `fullAddress`, `isActive` |
| DELETE, PATCH | `/ProviderBranchesAdmin/{id}`; `/ProviderBranchesAdmin/make-active/{id}` | Deactivate and activate requests respectively |
| GET | `/ProviderServiceAdmin/provider-services/{providerId}` | `PageNumber`, `PageSize`, `SearchTerm`, `Status` |
| POST, PUT | `/ProviderServiceAdmin/provider-services`; `/ProviderServiceAdmin/provider-services/{id}` | JSON `providerId`, `serviceId`, `priceBefore`, `discountPercentage`, `isSpecialOffer`, `isActive` |
| PATCH, DELETE | `/ProviderServiceAdmin/provider-services/{id}/activate`; `/ProviderServiceAdmin/provider-services/{id}` | Activate and deactivate requests respectively |
| GET | `/ProviderPackageAdmin` | `ProviderId`, `PageNumber`, `PageSize` |
| GET | `/ProviderPackageAdmin/{packageId}` | Path ID; service reads `data.data` |
| POST, PUT | `/ProviderPackageAdmin` | Multipart `ProviderId`, `NameAr`, `NameEn`, `ImageAr`, `ImageEn`, `DescriptionAr`, `DescriptionEn`, `PriceBefore`, `DiscountPercentage`, repeated `ServiceIds`; PUT also sends `PackageId` and omits unchanged image files |
| PATCH, DELETE | `/ProviderPackageAdmin/{packageId}/toggle-active`; `/ProviderPackageAdmin/{packageId}` | Status toggle and delete requests |

The provider service writes image and text fields as `FormData`. Package create also uses `FormData`, while package update includes an image only if the form value is a new `File`. The client displays package `priceAfter` and `totalDiscount` from responses; it does not establish the backend price formula.

## Clients, invoices, tickets, and dashboard

Sources: [clients](../src/features/clients/services/clientsService.js), [invoices](../src/features/invoices/services/invoicesService.js), [invoice hook](../src/features/invoices/hooks/useInvoicesQuery.js), [tickets](../src/features/tickets/services/ticketsService.js), [dashboard](../src/features/dashboard/services/dashboardService.js).

| Method | Path relative to `/api/` | Parameters or body sent by client |
| --- | --- | --- |
| GET | `/ClientAdmin` | List hook sends `searchTerm`, `platformType`, `isMale`, `hasCard`, optional pool `id` and `sourceType`, `pageNumber`, `pageSize` |
| GET | `/ClientAdmin/export` | Export filters, `responseType: blob` |
| PUT | `/ClientAdmin/block` | `userId`, `isBlocked`; source calls the method an assumption |
| GET | `/ClientAdmin/{id}` | Path ID |
| GET | `/ClientAdmin/order-history` | `UserId`, `ProviderId`, `Status`, UTC `FromDate` and `ToDate`, `PageNumber`, `PageSize` |
| GET | `/ClientAdmin/{clientId}/family-members` | Path ID |
| GET | `/ProviderBranchView/invoices/{invoiceId}/details` | Path ID, used from client details |
| GET | `/AdminLookup/clients` | `SearchTerm`, `PageNumber`, `PageSize` |
| GET | `/admin/invoices` | `PageNumber`, `PageSize`, `SearchTerm`, `ClientId`, `ProviderId`, `ProviderBranchId`, `Status`, UTC `FromDate`/`ToDate`, `IsCash` |
| GET | `/admin/invoices/export` | Similar filters without page fields, `responseType: blob` |
| GET | `/ApprovalHistory/invoices/{orderNo}/timeline` | Path order number; request accepts an abort signal |
| GET | `/admin/tickets` | `SearchTerm`, `ClientId`, `TicketTypeId`, `ProviderId`, `EmployeeGroupId`, `Priority`, `IsClosed`, `PageNumber`, `PageSize` |
| GET | `/admin/tickets/{id}` | Path ID |
| POST | `/admin/tickets` | `ticketTypeId`, `userId`, nullable `providerId` and `assignedToGroupId`, `userPhoneNumber`, `priority`, `description` |
| PUT | `/admin/tickets/{id}` | Nonempty fields of a feature-built update payload, including status/closed state and optional reply |
| GET | `admin/dashboard` | `FromDate`, `ToDate` |
| GET | `admin/dashboard/chart` | `GroupBy`, `Year` |

Client order-history and invoice date filters are converted to UTC start/end-of-day strings in their respective hooks/services. Invoice and client exports are Blob requests. The timeline service checks `succeeded` before returning inner data. Ticket create/update return the response body unchanged; the details UI reads nested `data` and `ticketTimelines`.

## Cards and location map

Sources: [card pools](../src/features/cardPool/services/cardPoolService.js), [sold cards](../src/features/sold-card/services/cardSoldService.js), [missed cards](../src/features/missedCard/services/cardMissedService.js), [card activation](../src/features/cardActivtion/services/cardActivationService.js), [provider map](../src/features/provider-map/services/ProviderMapService.js), [client map](../src/features/provider-map/services/ClientMapService.js).

| Method | Path relative to `/api/` | Parameters or body sent by client |
| --- | --- | --- |
| GET | `/CardPoolAdmin` | `SearchTerm`, UTC `FromDate`/`ToDate`, `PageNumber`, `PageSize` |
| GET | `/CardPoolAdmin/sold-cards` | `CardPoolId`, `SearchTerm`, `PageNumber`, `PageSize` |
| POST | `/CardPoolAdmin` | URL-encoded `count` |
| GET, DELETE | `/CardPoolAdmin/{id}/export`; `/CardPoolAdmin/{id}` | Export uses `responseType: blob` |
| GET | `/admin/card-solds` | `SearchTerm`, `FromDate`, `ToDate`, `PageNumber`, `PageSize` |
| POST | `/admin/card-solds/by-count` | Multipart `Count`, `ClientName`, `ClientPhone`, `ProofPayment` |
| POST | `/admin/card-solds/by-numbers` | Multipart repeated `CardNumbers`, `ClientName`, `ClientPhone`, `ProofPayment` |
| GET, DELETE | `/admin/card-solds/{id}/export`; `/admin/card-solds/{id}` | Export uses `responseType: blob` |
| GET | `/CardMissedAdmin` | `CardPoolId`, `SearchTerm`, `FromDate`, `ToDate`, `MissingType`, `PageNumber`, `PageSize` |
| POST, DELETE | `/CardMissedAdmin`; `/CardMissedAdmin/{id}` | Create sends `cardNumber` and `missingType` |
| GET | `/CardAdmin/not-activated` | `Id`, `SourceType`, `SearchTerm`, `PageNumber`, `PageSize` |
| GET | `/CardAdmin/not-activated-cards/export` | Same optional filters, `responseType: blob` |
| GET | `/MapAdmin/data` | Optional `providerCategoryId`; service expects `data.providers` and `data.governorates` |
| GET | `/MapAdmin/clients` | Service expects a location array in `data` |

The card activation service contains no activation mutation. Map hooks validate and aggregate received coordinates locally, as described in [providers and map](features/providers-and-map.md).

## Catalogs, notifications, and content

Sources: [provider categories](../src/features/categoreis/service/categoryService.js), [service categories](../src/features/ServiceCategory/services/Servicecategoriesservice.js), [services](../src/features/services-admin/services/ServicesService.js), [medicines](../src/features/Medicines/services/Medicinesservice.js), [specialists](../src/features/specialists/service/SpecialistsService.js), [governorates](../src/features/governorates/services/governoratesService.js), [cities](../src/features/cities/service/citeisService.js), [ticket types](../src/features/ticket-types/services/ticketTypesService.js), [plan types](../src/features/subscription-types/services/subscriptionTypesService.js), [sliders](../src/features/offer-sliders/service/sliderService.js), [notifications](../src/features/notificationsAdmin/services/notificationsService.js).

| Resource and paths relative to `/api/` | Methods and request details |
| --- | --- |
| `/ProviderCategoryAdmin/providerCategories`; `/ProviderCategoryAdmin/categories/{id}` | GET list with `PageNumber`, `PageSize`, `SearchTerm`; POST multipart bilingual names and `Logo`; PUT multipart names, `IsUpdatedImage`, optional `ImageUrl`; DELETE by ID |
| `/ServiceCategoryAdmin/ServiceCategories`; `/ServiceCategoryAdmin/categories/{id}` | GET list with `PageNumber`, `PageSize`, `SearchTerm`; POST and PUT multipart bilingual names/image fields; DELETE by ID |
| `/ServiceAdmin/services`; `/ServiceAdmin/services/{id}` | GET list/detail; list uses `PageNumber`, `PageSize`, `SearchTerm`, `CategoryId`, `Status`; POST/PUT JSON category, bilingual names, optional `serviceInstruction` and `cpt`; PUT also sends `isActive`; DELETE by ID |
| `/MedicineAdmin/medicines`; `/MedicineAdmin/medicines/{id}` | GET list/detail; list uses `PageNumber`, `PageSize`, `SearchTerm`; POST/PUT multipart names, price, form, optional image; PUT includes `isUpdatedImage`; DELETE by ID |
| `/SpecialistAdmin`; `/SpecialistAdmin/{id}` | GET list with page and search; POST/PUT bilingual names; DELETE by ID |
| `/GovernoratesAdmin`; `/GovernoratesAdmin/{id}` | GET list with page and search; POST/PUT bilingual names; DELETE by ID |
| `/CityAdmin/cities`; `/CityAdmin/cities/{id}` | GET list with page, search, `GovernorateId`, `IsActive`; POST/PUT bilingual names and `governorateId`; PUT also sends `cityId`; DELETE by ID |
| `/ticket-types`; `/ticket-types/{id}` | GET list with `Search` and page fields; POST/PUT bilingual names; DELETE by ID |
| `/PlanTypeAdmin`; `/PlanTypeAdmin/{id}`; `/PlanTypeAdmin/{id}/toggle-active` | GET list with search and page fields; POST/PUT bilingual name/description, `priceBefore`, `discountPercentage`; DELETE and PATCH status toggle |
| `/SliderAdmin`; `/SliderAdmin/{id}` | GET list/detail; list uses `PageNumber`, `PageSize`, `ProviderName`; POST/PUT multipart `ProviderId` and English/Arabic images; PUT includes `Id` and image-change flags; DELETE by ID |
| `admin/notification-marketing`; `admin/notification-marketing/{notificationId}` | GET list, POST notification payload, DELETE by ID |
| `/AdminLookup/packages` | GET with no query parameters; client filters and paginates the returned array locally |

The [notification schema](../src/features/notificationsAdmin/schema/notificationSchema.js) maps form values to POST fields `title`, `messageEn`, `messageAr`, nullable `imageUrl`, `isMale`, `governmentId`, `targetId`, `durationDay`, numeric `targetType`, and nullable `scheduledAt`. Backend delivery and scheduling semantics are unverified.

Content services use the following calls: [terms](../src/features/termsAndConditions/services/Termsandconditionsservice.js) `GET/POST /TermsAndConditionsAdmin`, [refund policy](../src/features/refundPolicy/services/RefundPolicyservice.js) `GET/POST /RefundPolicyAdmin`, [privacy policy](../src/features/privacyPolicy/services/PrivacyPolicyservice.js) `GET/POST /PrivacyPolicyAdmin`, and [contact information](../src/features/contactUs/services/contactsUsService) `GET/POST /admin/contact-us`. Policy POST bodies contain `descriptionEn` and `descriptionAr`. Contact POST sends `phoneNumber`, `email`, `whatsApp`, and nullable `faceBook`, `instagram`, `tikTok`.

## Unverified contract points

- `PUT /ClientAdmin/block` is explicitly identified as an assumption in its service.
- Branch list hooks expect top-level pagination fields, while the service returns the response body unchanged. The backend shape has not been observed in this audit.
- `SearchTrem` in provider lookup is the source spelling; whether the server recognizes it is unknown.
- Application envelopes and `succeeded`/`success` flags are not handled uniformly by all services. A successful HTTP status does not necessarily mean every feature checks the application flag.
- Export file contents, permission enforcement, mutation side effects, notification delivery/timezone, and exact error payloads need backend or runtime verification.
