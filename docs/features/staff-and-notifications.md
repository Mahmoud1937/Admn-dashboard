# Staff and notifications

[README](../../README.md) · [Authentication and permissions](../authentication-and-permissions.md) · [API integration](../api-integration.md)

## Employees and permission editing

[`EmployeesPage`](../../src/features/employees/pages/EmployeesPage.jsx) lists employees with search, group filtering, and pagination. Its feature hooks support registration, editing, active-state toggle, password reset, and permission editing. [`employeesService.js`](../../src/features/employees/services/employeesService.js) sends employee list/details and update requests; registration goes to `POST /AuthAdmin/register`, and reset goes to `PATCH AuthAdmin/employees/{employeeId}/reset-password`. The service checks `succeeded` for several operations, but checks `success` for registration. Documented fields and response flags are those read by the client; backend behavior has not been exercised.

[`EmployeePermissionsModal`](../../src/features/employees/permissions/components/EmployeePermissionsModal.jsx) loads an employee's `permissionIds` and the catalog of `id`/`code` entries, groups codes for display, and submits selected IDs. Its UI auto-selects a group's `read` permission when another action is selected and clears other actions when `read` is removed. [`useEmployeePermissionsMutation`](../../src/features/employees/permissions/hooks/useEmployeePermissionsMutation.js) updates list cache, invalidates employee queries, and reloads the signed-in employee's permissions when that employee was edited. The source does not prove that the backend requires the same grouping rule.

## Admin notification inbox

The [navbar](../../src/navbar/Navbar.jsx) includes an [admin notification bell](../../src/navbar/AdminNotificationsMenu.jsx) with an unread badge, All/Unread filters, English/Arabic text, and a responsive dropdown. Escape and the close button return focus to the bell; clicking outside or moving focus away closes the dropdown.

The [inbox service](../../src/features/adminNotifications/services/adminNotificationsService.js) calls `GET admin/notifications` with `PageNumber`, `PageSize=10`, and optional boolean `IsRead`, reads `data.items` and pagination metadata, and maps each item's `body` to its display message. The [infinite query](../../src/features/adminNotifications/hooks/useAdminNotificationsQuery.js) scopes its cache to the signed-in employee, language, filter, and batch size, forwards cancellation, and refreshes every 30 seconds while the app is visible. Scrolling near the bottom of the open dropdown loads the next page and appends its records, deduplicated by notification ID. A spinner appears at the bottom while earlier records remain visible. Server page metadata stops loading at the end. Failed additional pages retain existing records and offer a retry without continuously retriggering requests. The dropdown has no numbered pages or page-size control. Switching filters or reopening the dropdown resets its scroll position.

The [connected menu](../../src/features/adminNotifications/components/AdminNotifications.jsx) first marks an unread notification as read through `PATCH admin/notifications/{notificationId}/read`, with the notification's `id` in the path and no body. It requires successful `data: true`; a rejected response leaves the notification and count unchanged and shows a retryable inline error. The [read mutation](../../src/features/adminNotifications/hooks/useAdminNotificationReadMutation.js) refreshes the initiating employee's cached notification lists and unread count after success, including other cached languages and filters. Loaded batches refresh against the current server pagination when unread items disappear.

`ManualPrescriptionCreated` notifications then open `/prescriptions/{referenceId}`. Other types can be marked as read without navigating. An already-read notification opens its known destination without another PATCH. The existing authenticated route controls access to prescription details. No separate notification permission code is assumed.

The unread badge reads the numeric `data` returned by `GET admin/notifications/unread-count`, independently of list pagination and filtering. A zero count removes the badge. The Unread filter sends `IsRead=false` and starts at page one. An unavailable count does not substitute the current page's unread total.

The Mark all as read button uses `PATCH admin/notifications/read-all` with no body. Its [mutation](../../src/features/adminNotifications/hooks/useAdminNotificationsReadAllMutation.js) refreshes the initiating employee's notification lists and unread count after a successful nonnegative integer response; `data: 0` is valid. The response value is not used as the unread count. The button disables while a read action is pending or the unread count is zero. Failure keeps the existing list/count and shows a retryable inline error. Success clears the unread filter through refetching and preserves notification history in All.

The presentation component accepts:

- `notifications`: display records shaped as `{ id, title, message, createdAt, isRead }`, in the order supplied by the API integration.
- `unreadCount`: server total; standalone, unpaginated usage can derive a count from its records. The visible badge caps at `99+`, while its accessible label keeps the full count.
- `isLoading`, `isRefreshing`, `error`, and `onRetry`: loading, background refresh, and retryable fetch states.
- `onMarkAsRead(id)` and `onMarkAllAsRead()`: optional asynchronous callbacks. Their integration must update the supplied records and unread count after a successful request. Rejected promises show an error without clearing unread state.
- `onSelect(notification)` and `canSelect(notification)`: optional navigation and eligibility callbacks.
- `hasMore`, `isLoadingMore`, `loadMoreError`, and `onLoadMore`: automatic scroll loading and retry state. The global unread count remains independent of loaded batches.

The localization browser checks exercise the presentation, API mapping, server filtering, dedicated unread count (including zero), automatic scroll loading, append/retry/end-of-list behavior, English/Arabic loading states, single/bulk read success and failure (including `read-all` returning zero), and prescription navigation with fixture-only data at desktop and mobile widths; they do not contact the live backend.

## Marketing notifications

[`NotificationsPage`](../../src/features/notificationsAdmin/pages/NotificationsPage.jsx) lists marketing notifications and permission-gates create and delete buttons. Its page uses a local four-second success/error toast, while [the mutations](../../src/features/notificationsAdmin/hooks/useNotificationMutations.js) invalidate the notifications query.

[`NotificationFormModal`](../../src/features/notificationsAdmin/components/NotificationFormModal.jsx) uses React Hook Form and [`notificationSchema.js`](../../src/features/notificationsAdmin/schema/notificationSchema.js). It validates title, English and Arabic messages, optional URL and targeting fields, an immediate or scheduled send mode, and a future local date/time for scheduling. `toPayload` sends nullable optional fields and a `scheduledAt` string only for the scheduled mode. Target type 1 is labeled Provider and 2 Package in the UI. The [notification service](../../src/features/notificationsAdmin/services/notificationsService.js) posts that payload to `admin/notification-marketing`. The client labels successful create as “sent”; actual delivery, recipient selection, scheduling timezone, and cancellation behavior require backend confirmation.

The package lookup for notification targeting fetches the full array from `GET /AdminLookup/packages` without query parameters, then performs search and pagination locally in the service. It is not a server-paginated lookup.
