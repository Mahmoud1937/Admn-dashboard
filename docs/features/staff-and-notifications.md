# Staff and notifications

[README](../../README.md) · [Authentication and permissions](../authentication-and-permissions.md) · [API integration](../api-integration.md)

## Employees and permission editing

[`EmployeesPage`](../../src/features/employees/pages/EmployeesPage.jsx) lists employees with search, group filtering, and pagination. Its feature hooks support registration, editing, active-state toggle, password reset, and permission editing. [`employeesService.js`](../../src/features/employees/services/employeesService.js) sends employee list/details and update requests; registration goes to `POST /AuthAdmin/register`, and reset goes to `PATCH AuthAdmin/employees/{employeeId}/reset-password`. The service checks `succeeded` for several operations, but checks `success` for registration. Documented fields and response flags are those read by the client; backend behavior has not been exercised.

[`EmployeePermissionsModal`](../../src/features/employees/permissions/components/EmployeePermissionsModal.jsx) loads an employee's `permissionIds` and the catalog of `id`/`code` entries, groups codes for display, and submits selected IDs. Its UI auto-selects a group's `read` permission when another action is selected and clears other actions when `read` is removed. [`useEmployeePermissionsMutation`](../../src/features/employees/permissions/hooks/useEmployeePermissionsMutation.js) updates list cache, invalidates employee queries, and reloads the signed-in employee's permissions when that employee was edited. The source does not prove that the backend requires the same grouping rule.

## Marketing notifications

[`NotificationsPage`](../../src/features/notificationsAdmin/pages/NotificationsPage.jsx) lists marketing notifications and permission-gates create and delete buttons. Its page uses a local four-second success/error toast, while [the mutations](../../src/features/notificationsAdmin/hooks/useNotificationMutations.js) invalidate the notifications query.

[`NotificationFormModal`](../../src/features/notificationsAdmin/components/NotificationFormModal.jsx) uses React Hook Form and [`notificationSchema.js`](../../src/features/notificationsAdmin/schema/notificationSchema.js). It validates title, English and Arabic messages, optional URL and targeting fields, an immediate or scheduled send mode, and a future local date/time for scheduling. `toPayload` sends nullable optional fields and a `scheduledAt` string only for the scheduled mode. Target type 1 is labeled Provider and 2 Package in the UI. The [notification service](../../src/features/notificationsAdmin/services/notificationsService.js) posts that payload to `admin/notification-marketing`. The client labels successful create as “sent”; actual delivery, recipient selection, scheduling timezone, and cancellation behavior require backend confirmation.

The package lookup for notification targeting fetches the full array from `GET /AdminLookup/packages` without query parameters, then performs search and pagination locally in the service. It is not a server-paginated lookup.
