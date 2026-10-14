# Catalog and content

[README](../../README.md) · [API integration](../api-integration.md) · [Forms and UI states](../forms-and-ui-states.md)

## Reference and service catalogs

The dashboard exposes CRUD pages for [provider categories](../../src/features/categoreis/service/categoryService.js), [service categories](../../src/features/ServiceCategory/services/Servicecategoriesservice.js), [services](../../src/features/services-admin/services/ServicesService.js), [specialists](../../src/features/specialists/service/SpecialistsService.js), [governorates](../../src/features/governorates/services/governoratesService.js), [cities](../../src/features/cities/service/citeisService.js), [ticket types](../../src/features/ticket-types/services/ticketTypesService.js), and [subscription/plan types](../../src/features/subscription-types/services/subscriptionTypesService.js). Their pages use feature-owned hooks, schemas, and tables. Most lists pass page number, page size, and search text. Service lists also filter by category and status; city lists filter by governorate and active state.

Category creation and update send bilingual names and image fields as multipart data. Services send category, bilingual name, optional instruction, and optional CPT fields as JSON. Subscription types send bilingual name/description, price, and discount percentage and have an active-state toggle. The meaning of prices, CPT values, and server-side deletion rules is backend-dependent.

[Medicines](../../src/features/Medicines/services/Medicinesservice.js) have a separate list/detail and multipart create/update service. The form sends bilingual names, price, form, and an optional image; update sends an image-change flag and only sends a new image when selected. These are client payload rules, not a complete medicine data contract.

## Sliders

[Offer sliders](../../src/features/offer-sliders/pages/SlidersPage.jsx) list records with pagination and provider-name search. [`sliderService.js`](../../src/features/offer-sliders/service/sliderService.js) loads details and creates/updates multipart records with a provider ID and English/Arabic image files. Update includes image-change flags. The [detail page](../../src/features/offer-sliders/pages/SliderDetailsPage.jsx) supports viewing and editing. Live image storage or publishing behavior is not established by the source.

## Policy and contact content

Terms and conditions, refund policy, and privacy policy each have a GET and POST service using `descriptionEn` and `descriptionAr`: [terms](../../src/features/termsAndConditions/services/Termsandconditionsservice.js), [refund](../../src/features/refundPolicy/services/RefundPolicyservice.js), and [privacy](../../src/features/privacyPolicy/services/PrivacyPolicyservice.js). Their pages expose bilingual editing; [`BilingualRichTextEditor`](../../src/shared/components/BilingualRichTextEditor.jsx) is shared UI for this kind of content.

[Contact information](../../src/features/contactUs/services/contactsUsService) uses `GET /admin/contact-us` and `POST /admin/contact-us` with phone, email, WhatsApp, and optional social account fields. The service file currently has no extension. The backend's publication timing and external visibility of these content changes cannot be determined from this client.
