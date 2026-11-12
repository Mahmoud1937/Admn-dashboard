# English and Arabic localization audit

Completed 12 November 2026. The application continues to use its existing i18next/react-i18next setup and namespaces. API routes, request payloads, permissions and backend behavior are unchanged.

## Fixes

- Invoice column headers are translated. Arabic mode aligns client names and both provider-name fields to the right, uses RTL table direction and keeps the existing columns, widths and sticky actions. English retains LTR and left-aligned names; numeric and centered columns keep their alignment.
- Ticket priorities, grouping controls, status/timeline labels, validation errors, dropdown defaults and drawer direction follow the active language. Priority colors use numeric IDs so translation does not change them.
- Notifications and templates translate image controls, repeat hints, delivery summaries, preview text, action descriptions, event choices and validation feedback. Image filenames and selections survive switching languages. Calendars use Arabic month/day labels in Arabic mode.
- Terms and Conditions, Refund Policy and Privacy Policy choose the content tab matching the application language on entry and on later language changes. Manual tab selection is supported and unsaved edits are preserved. Titles, descriptions, toolbars, character counts and empty states are translated.
- Contact Us uses localized labels and validation, follows RTL/LTR, and isolates phone numbers, addresses and URLs as LTR content. Its API data contains contact fields rather than separate English/Arabic documents.
- Shared controls now localize known schema/API messages at display time, dropdown feedback, uploads, image previews, session feedback and confirmation dialogs. Additional fixes cover employees, brokers, cards, cities, governorates, sliders, subscriptions and provider services.
- Document and body language/direction are synchronized. Inputs and search controls inherit the active direction. Language changes cancel stale localized requests and refresh active data; permission initialization queries are excluded.
- Reused existing translations and added missing keys to both languages. Duplicate JSON entries were removed while preserving their effective values. No additional translation library was introduced.

## Verification

| Check | Result |
| --- | --- |
| Production build: npm.cmd run build | Passed |
| Full lint: npm.cmd run lint | Passed, zero errors; one existing React Hook Form watch warning in BranchFormModal.jsx |
| Catalog/static audit: node scripts/verifyLocalization.mjs | Passed: 15 namespaces and 2,269 static key references; matching language keys, duplicate-key checks, interpolation checks and hardcoded UI scan |
| Browser: node scripts/verifyLocalizationBrowser.mjs | Passed: 86 assertions at 1440px and 390px, using actual components and mocked API responses |
| Existing localization regression scripts | All nine passed |
| git diff --check | Passed |

The browser suite covers invoices in both directions, ticket validation after a live language switch, priority colors, notification delivery/calendar text, image selection/removal, preview language, network/status feedback, all three legal pages, Contact Us, language headers and preservation of unsaved legal edits. It runs a temporary headless Chromium profile and makes no live backend mutations. Set CHROME_PATH if Chromium is installed outside a standard location.

Existing suites run:

- node scripts/verifyBranchesLocalization.mjs
- node scripts/verifyClientsMedicinesPrescriptionsLocalization.mjs
- node scripts/verifyDashboardLocalization.mjs
- node scripts/verifyLoginShellLocalization.mjs
- node scripts/verifyProviderCategoriesLocalization.mjs
- node scripts/verifyProviderDetailsLocalization.mjs
- node scripts/verifyProviderMapLocalization.mjs
- node scripts/verifyProvidersLocalization.mjs
- node scripts/verifyServicesLocalization.mjs

Updated older expectations for Arabic currency and direction. The provider refresh-header test now exercises the expired-token request path with a known clock; restoring an already valid session does not refresh it. Authentication implementation was not changed.

The production build still reports the existing Vite configuration warning that its esbuild drop options are ignored when oxc options are present.

## Remaining content and limits

No remaining untranslated application-owned UI labels were found in the audit. Brand names, filenames, identifiers, file formats, URL examples and user-entered names remain unchanged intentionally.

Unknown backend messages and authored content are preserved rather than automatically translated. Live-server translation coverage was not verified: the browser suite uses fixtures. Arabic legal content must exist in the API's descriptionAr field; missing content displays the localized empty state. This change selects existing bilingual content and does not author legal policies or modify backend contracts.

## Modified files

104 files, including new verification fixtures and this report:

- [docs/localization-audit.md](../docs/localization-audit.md)
- [package.json](../package.json)
- [scripts/fixtures/localization.html](../scripts/fixtures/localization.html)
- [scripts/fixtures/localization.jsx](../scripts/fixtures/localization.jsx)
- [scripts/verifyClientsMedicinesPrescriptionsLocalization.mjs](../scripts/verifyClientsMedicinesPrescriptionsLocalization.mjs)
- [scripts/verifyDashboardLocalization.mjs](../scripts/verifyDashboardLocalization.mjs)
- [scripts/verifyLocalization.mjs](../scripts/verifyLocalization.mjs)
- [scripts/verifyLocalizationBrowser.mjs](../scripts/verifyLocalizationBrowser.mjs)
- [scripts/verifyLoginShellLocalization.mjs](../scripts/verifyLoginShellLocalization.mjs)
- [scripts/verifyProvidersLocalization.mjs](../scripts/verifyProvidersLocalization.mjs)
- [src/app/router.jsx](../src/app/router.jsx)
- [src/features/auth/components/SessionExpiredModal.jsx](../src/features/auth/components/SessionExpiredModal.jsx)
- [src/features/branches/components/CitySelect.jsx](../src/features/branches/components/CitySelect.jsx)
- [src/features/branches/hooks/useBranchMutations.js](../src/features/branches/hooks/useBranchMutations.js)
- [src/features/brokers/components/BrokerFormModal.jsx](../src/features/brokers/components/BrokerFormModal.jsx)
- [src/features/brokers/components/BrokersTable.jsx](../src/features/brokers/components/BrokersTable.jsx)
- [src/features/brokers/pages/BrokersPage.jsx](../src/features/brokers/pages/BrokersPage.jsx)
- [src/features/cardPool/components/Cardpoolcreatemodal.jsx](../src/features/cardPool/components/Cardpoolcreatemodal.jsx)
- [src/features/cities/components/CityFormModal.jsx](../src/features/cities/components/CityFormModal.jsx)
- [src/features/cities/components/GovernorateSelect.jsx](../src/features/cities/components/GovernorateSelect.jsx)
- [src/features/cities/pages/cityPages.jsx](../src/features/cities/pages/cityPages.jsx)
- [src/features/clients/components/InvoiceDetailsModal.jsx](../src/features/clients/components/InvoiceDetailsModal.jsx)
- [src/features/clients/components/OrderHistorySection.jsx](../src/features/clients/components/OrderHistorySection.jsx)
- [src/features/contactUs/pages/ContactUsPage.jsx](../src/features/contactUs/pages/ContactUsPage.jsx)
- [src/features/dashboard/components/DashboardCharts.jsx](../src/features/dashboard/components/DashboardCharts.jsx)
- [src/features/dashboard/components/StatCards.jsx](../src/features/dashboard/components/StatCards.jsx)
- [src/features/employees/components/EmployeeFormModal.jsx](../src/features/employees/components/EmployeeFormModal.jsx)
- [src/features/employees/components/EmployeesTable.jsx](../src/features/employees/components/EmployeesTable.jsx)
- [src/features/employees/components/ResetPasswordModal.jsx](../src/features/employees/components/ResetPasswordModal.jsx)
- [src/features/employees/pages/EmployeesPage.jsx](../src/features/employees/pages/EmployeesPage.jsx)
- [src/features/governorates/components/GovernorateFormModel.jsx](../src/features/governorates/components/GovernorateFormModel.jsx)
- [src/features/governorates/pages/GovernoratesPage.jsx](../src/features/governorates/pages/GovernoratesPage.jsx)
- [src/features/invoices/components/InvoicesFilters.jsx](../src/features/invoices/components/InvoicesFilters.jsx)
- [src/features/invoices/components/InvoicesTable.jsx](../src/features/invoices/components/InvoicesTable.jsx)
- [src/features/invoices/components/TimelineModal.jsx](../src/features/invoices/components/TimelineModal.jsx)
- [src/features/invoices/hooks/useInvoiceTimeline.js](../src/features/invoices/hooks/useInvoiceTimeline.js)
- [src/features/missedCard/components/CardMissedCreateModal.jsx](../src/features/missedCard/components/CardMissedCreateModal.jsx)
- [src/features/missedCard/pages/CardMissedPage.jsx](../src/features/missedCard/pages/CardMissedPage.jsx)
- [src/features/notificationTemplates/components/NotificationTemplateFormModal.jsx](../src/features/notificationTemplates/components/NotificationTemplateFormModal.jsx)
- [src/features/notificationTemplates/components/NotificationTemplatesTable.jsx](../src/features/notificationTemplates/components/NotificationTemplatesTable.jsx)
- [src/features/notificationsAdmin/components/NotificationEditModal.jsx](../src/features/notificationsAdmin/components/NotificationEditModal.jsx)
- [src/features/notificationsAdmin/components/NotificationFormModal.jsx](../src/features/notificationsAdmin/components/NotificationFormModal.jsx)
- [src/features/notificationsAdmin/components/NotificationImageField.jsx](../src/features/notificationsAdmin/components/NotificationImageField.jsx)
- [src/features/notificationsAdmin/components/NotificationsTable.jsx](../src/features/notificationsAdmin/components/NotificationsTable.jsx)
- [src/features/notificationsAdmin/hooks/useNotificationMutations.js](../src/features/notificationsAdmin/hooks/useNotificationMutations.js)
- [src/features/notificationsAdmin/pages/NotificationsPage.jsx](../src/features/notificationsAdmin/pages/NotificationsPage.jsx)
- [src/features/offer-sliders/components/SliderFormModal.jsx](../src/features/offer-sliders/components/SliderFormModal.jsx)
- [src/features/offer-sliders/pages/SlidersPage.jsx](../src/features/offer-sliders/pages/SlidersPage.jsx)
- [src/features/privacyPolicy/pages/PrivacyPolicyPage.jsx](../src/features/privacyPolicy/pages/PrivacyPolicyPage.jsx)
- [src/features/providerAttachments/components/ProviderAttachmentFileInput.jsx](../src/features/providerAttachments/components/ProviderAttachmentFileInput.jsx)
- [src/features/providerServices/components/PriceListFormModal.jsx](../src/features/providerServices/components/PriceListFormModal.jsx)
- [src/features/providerServices/components/ServiceSelect.jsx](../src/features/providerServices/components/ServiceSelect.jsx)
- [src/features/providerServices/hooks/useProviderServiceMutations.js](../src/features/providerServices/hooks/useProviderServiceMutations.js)
- [src/features/providerServices/hooks/useProviderServiceToggleMutation.js](../src/features/providerServices/hooks/useProviderServiceToggleMutation.js)
- [src/features/providers/components/ProviderCategorySelect.jsx](../src/features/providers/components/ProviderCategorySelect.jsx)
- [src/features/refundPolicy/pages/RefundPolicyPage.jsx](../src/features/refundPolicy/pages/RefundPolicyPage.jsx)
- [src/features/services-admin/components/SpecialistSelect.jsx](../src/features/services-admin/components/SpecialistSelect.jsx)
- [src/features/sold-card/components/CardSoldCreateModal.jsx](../src/features/sold-card/components/CardSoldCreateModal.jsx)
- [src/features/specialists/components/SpecialistFormModal.jsx](../src/features/specialists/components/SpecialistFormModal.jsx)
- [src/features/specialists/pages/SpecialistsPage.jsx](../src/features/specialists/pages/SpecialistsPage.jsx)
- [src/features/subscription-types/components/SubscriptionTypeFormModal.jsx](../src/features/subscription-types/components/SubscriptionTypeFormModal.jsx)
- [src/features/subscription-types/components/SubscriptionTypesTable.jsx](../src/features/subscription-types/components/SubscriptionTypesTable.jsx)
- [src/features/subscription-types/pages/SubscriptionTypesPage.jsx](../src/features/subscription-types/pages/SubscriptionTypesPage.jsx)
- [src/features/termsAndConditions/components/Termsandconditionseditor.jsx](../src/features/termsAndConditions/components/Termsandconditionseditor.jsx)
- [src/features/ticket-types/components/TicketTypeFormModal.jsx](../src/features/ticket-types/components/TicketTypeFormModal.jsx)
- [src/features/ticket-types/pages/TicketTypesPage.jsx](../src/features/ticket-types/pages/TicketTypesPage.jsx)
- [src/features/tickets/components/TicketDetailsModal.jsx](../src/features/tickets/components/TicketDetailsModal.jsx)
- [src/features/tickets/components/TicketFormModal.jsx](../src/features/tickets/components/TicketFormModal.jsx)
- [src/features/tickets/components/TicketsBoard.jsx](../src/features/tickets/components/TicketsBoard.jsx)
- [src/features/tickets/components/ticket-details/TicketDetailsOverview.jsx](../src/features/tickets/components/ticket-details/TicketDetailsOverview.jsx)
- [src/features/tickets/components/ticket-details/TicketTimeline.jsx](../src/features/tickets/components/ticket-details/TicketTimeline.jsx)
- [src/features/tickets/utils/ticketColors.js](../src/features/tickets/utils/ticketColors.js)
- [src/features/tickets/utils/ticketDetailsUtils.js](../src/features/tickets/utils/ticketDetailsUtils.js)
- [src/index.css](../src/index.css)
- [src/layout/DashboardLayout.jsx](../src/layout/DashboardLayout.jsx)
- [src/localization/i18n.js](../src/localization/i18n.js)
- [src/localization/locales/ar/adminPages.json](../src/localization/locales/ar/adminPages.json)
- [src/localization/locales/ar/common.json](../src/localization/locales/ar/common.json)
- [src/localization/locales/ar/providerDetails.json](../src/localization/locales/ar/providerDetails.json)
- [src/localization/locales/en/adminPages.json](../src/localization/locales/en/adminPages.json)
- [src/localization/locales/en/common.json](../src/localization/locales/en/common.json)
- [src/localization/locales/en/providerDetails.json](../src/localization/locales/en/providerDetails.json)
- [src/localization/localizeAttachmentError.js](../src/localization/localizeAttachmentError.js)
- [src/localization/localizeMessage.js](../src/localization/localizeMessage.js)
- [src/localization/useContentLanguage.js](../src/localization/useContentLanguage.js)
- [src/localization/useLanguage.js](../src/localization/useLanguage.js)
- [src/shared/components/BilingualRichTextEditor.jsx](../src/shared/components/BilingualRichTextEditor.jsx)
- [src/shared/components/DateInput.jsx](../src/shared/components/DateInput.jsx)
- [src/shared/components/DateRangeFilterFields.jsx](../src/shared/components/DateRangeFilterFields.jsx)
- [src/shared/components/FilterPanel.jsx](../src/shared/components/FilterPanel.jsx)
- [src/shared/components/FormModalShell.jsx](../src/shared/components/FormModalShell.jsx)
- [src/shared/components/ImageLightbox.jsx](../src/shared/components/ImageLightbox.jsx)
- [src/shared/components/ImageUploadField.jsx](../src/shared/components/ImageUploadField.jsx)
- [src/shared/components/LazyImageCell.jsx](../src/shared/components/LazyImageCell.jsx)
- [src/shared/components/NotificationPreview.jsx](../src/shared/components/NotificationPreview.jsx)
- [src/shared/components/Protectedroute.jsx](../src/shared/components/Protectedroute.jsx)
- [src/shared/components/ProviderSelect.jsx](../src/shared/components/ProviderSelect.jsx)
- [src/shared/components/RowActions.jsx](../src/shared/components/RowActions.jsx)
- [src/shared/components/SearchBarWithFilters.jsx](../src/shared/components/SearchBarWithFilters.jsx)
- [src/shared/components/SearchableAsyncSelect.jsx](../src/shared/components/SearchableAsyncSelect.jsx)
- [src/shared/components/TextField.jsx](../src/shared/components/TextField.jsx)
- [src/shared/helpers/apiErrorHandler.js](../src/shared/helpers/apiErrorHandler.js)
- [src/shared/utils/handleMutationError.js](../src/shared/utils/handleMutationError.js)
- [src/utils/formatDate.js](../src/utils/formatDate.js)
