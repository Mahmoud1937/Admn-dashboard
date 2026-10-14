# Forms and UI states

[README](../README.md) · [API integration](api-integration.md)

## Form patterns

Many feature forms use React Hook Form with `zodResolver` and feature-owned Zod schemas. Examples are [login](../src/features/auth/pages/LoginPage.jsx), [provider packages](../src/features/providerPackages/components/ProviderPackageFormModal.jsx), [tickets](../src/features/tickets/components/TicketFormModal.jsx), and [notifications](../src/features/notificationsAdmin/components/NotificationFormModal.jsx). The [forced password modal](../src/features/auth/components/ChangePasswordModal.jsx) instead uses local React state with schema validation. Do not assume all forms use one implementation.

Schemas express client-side requirements only. For example, [provider package validation](../src/features/providerPackages/schema/providerPackageSchema.js) requires bilingual names and descriptions, a nonnegative price, a 0–100 discount percentage, images, and at least one selected service. Create requires image files; update accepts existing image strings or files. The form converts numeric strings and selected service objects before the service constructs multipart data. The backend may impose additional requirements.

Shared controls include [`TextField`](../src/shared/components/TextField.jsx), [`NumberInput`](../src/shared/components/NumberInput.jsx), [`ImageUploadField`](../src/shared/components/ImageUploadField.jsx), [`SearchableAsyncSelect`](../src/shared/components/SearchableAsyncSelect.jsx), [`FormModalShell`](../src/shared/components/FormModalShell.jsx), and [`ConfirmDeleteModal`](../src/shared/components/ConfirmDeleteModal.jsx). Image selection can use [client-side compression](../src/shared/utils/compressImage.js). Bilingual fields and the rich-text editor preserve Arabic text direction in their own UI.

## Server validation and mutation failures

[`handleMutationError`](../src/shared/utils/handleMutationError.js) distinguishes connection errors, HTTP 5xx, 401, 403, an `errors` array, an `errors` object, and a general backend message. It shows toast messages for most cases and passes an error object to the feature when field mapping is possible. [`applyServerErrors`](../src/shared/utils/applyServerErrors.js) lowercases the first character of each backend field key, chooses the first message in an array, humanizes it, and calls React Hook Form's `setError`. It does not normalize arbitrary nested paths or guarantee a matching form control.

Not every feature uses that shared flow. [Notification mutations](../src/features/notificationsAdmin/hooks/useNotificationMutations.js) flatten backend errors into a local page toast. [ProviderInfoForm](../src/features/providers/components/ProviderInfoForm.jsx) applies backend errors directly. [Ticket details utilities](../src/features/tickets/utils/ticketDetailsUtils.js) map update errors to known ticket fields. A non-HTTP error without `error.response` is commonly described as a connection failure by the shared helper; that message is the helper's behavior, not proof of the underlying cause.

## Loading, empty, success, and error states

| Situation | Implemented examples |
| --- | --- |
| Route loading | [`App` Suspense](../src/app/App.jsx) renders a spinner while a lazy page loads; [`ProtectedRoute`](../src/shared/components/Protectedroute.jsx) renders a session-loading spinner. |
| Query loading | [Provider packages](../src/features/providerPackages/components/ProviderPackagesTab.jsx) show card skeletons; [dashboard cards](../src/features/dashboard/components/StatCards.jsx) show skeletons. Other pages use table loading indicators. |
| Empty data | [`TableEmptyState`](../src/shared/components/TableEmptyState.jsx) can distinguish an empty list from a filtered search; [provider packages](../src/features/providerPackages/components/ProviderPackagesTab.jsx) use it for an empty result. |
| Query failure | [`QueryErrorState`](../src/shared/components/QueryErrorState.jsx) distinguishes a response error from a request with no response and exposes a retry button. Features can instead render their own error UI. |
| Successful mutation | Many mutation hooks show a React Hot Toast success message, close a modal, and invalidate Query data; [ticket mutations](../src/features/tickets/hooks/useTicketMutations.js) are one example. |

Coverage varies by page. For example, [`InvoicesPage`](../src/features/invoices/pages/InvoicesPage.jsx) reads `data` and `isLoading` from its query but does not render its `isError` or `error` state. The docs describe this as current behavior, not as an intended error policy. The shared Axios response interceptor handles only HTTP 401; it does not globally turn application-level `succeeded: false` responses into exceptions. Individual services or hooks sometimes check that flag.

Exports use a separate loading flag and a browser Blob download; see [clients and operations](features/clients-and-operations.md).
