/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "../shared/components/Protectedroute";
import PermissionRoute from "../features/auth/components/PermissionRoute";
import { PERMISSION_CODES } from "../features/auth/constants/permissionCodes";
const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const NotFoundPage = lazy(() => import("../shared/components/NotFoundPage"));
const ProvidersPage = lazy(() => import("../features/providers/pages/ProvidersPage"));
const BranchesPage = lazy(() => import("../features/branches/pages/BranchesPage"));
const ProviderDetailsPage = lazy(() => import("../features/providers/pages/ProviderDetailsPage"));
const GovernoratesPage = lazy(() => import("../features/governorates/pages/GovernoratesPage"));
const CategoriesPage = lazy(() => import("../features/categoreis/pages/CategoryPage"));
const CitiesPage = lazy(() => import("../features/cities/pages/cityPages"));
const SpecialistsPage = lazy(() => import("../features/specialists/pages/SpecialistsPage"));
const ServiceCategoriesPage = lazy(() => import("../features/ServiceCategory/pages/ServiceCategoriesPage"));
const MedicinesPage = lazy(() => import("../features/Medicines/pages/Medicinespage"));
const ServicesPage = lazy(() => import("../features/services-admin/pages/ServicesPage"));
const ProviderMapPage = lazy(() => import("../features/provider-map/pages/ProviderMapPage"));
const SlidersPage = lazy(() => import("../features/offer-sliders/pages/SlidersPage"));
const SliderDetailsPage = lazy(() => import("../features/offer-sliders/pages/SliderDetailsPage"));
const TermsAndConditionsPage = lazy(() => import("../features/termsAndConditions/pages/TermsAndConditionsPage"));
const RefundPolicyPage = lazy(() => import("../features/refundPolicy/pages/RefundPolicyPage"));
const PrivacyPolicyPage = lazy(() => import("../features/privacyPolicy/pages/PrivacyPolicyPage"));
const ContactUsPage = lazy(() => import("../features/contactUs/pages/ContactUsPage"));
const CardPoolPage = lazy(() => import("../features/cardPool/pages/Cardpoolpage"));
const CardSoldPage = lazy(() => import("../features/sold-card/pages/CardSoldPage"));
const CardMissedPage = lazy(() => import("../features/missedCard/pages/CardMissedPage"));
const SoldCardsByPoolPage = lazy(() => import("../features/cardPool/pages/SoldCardsByPoolPage"));
const ClientsPage = lazy(() => import("../features/clients/pages/ClientsPage"));
const ClientDetailsPage = lazy(() => import("../features/clients/pages/ClientDetailsPage"));
const CardActivationPage = lazy(() => import("../features/cardActivtion/pages/CardActivationPage"));
const InvoicesPage = lazy(() => import("../features/invoices/pages/InvoicesPage"));
const TicketTypesPage = lazy(() => import("../features/ticket-types/pages/TicketTypesPage"));
const SubscriptionTypesPage = lazy(() => import("../features/subscription-types/pages/SubscriptionTypesPage"));
const TicketsPage = lazy(() => import("../features/tickets/pages/TicketsPage"));
const EmployeesPage = lazy(() => import("../features/employees/pages/EmployeesPage"));
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const ForceChangePasswordPage = lazy(() =>
  import("../features/auth/pages/ForceChangePasswordPage")
);

const withPermission = (permission, element) => (
  <PermissionRoute permission={permission}>{element}</PermissionRoute>
);

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/change-password",
    element: <ForceChangePasswordPage />,
  },
  {
    // Layout route: nothing under "/" renders unless AuthContext has a
    // valid (non-expired) JWT - otherwise ProtectedRoute redirects to /login.
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: withPermission(
              PERMISSION_CODES.DASHBOARD_READ,
              <DashboardPage />
            ),
          },

          {
            path: "providers",
            element: withPermission(
              PERMISSION_CODES.PROVIDERS_READ,
              <ProvidersPage />
            ),
          },

          {
            path: "branches",
            element: withPermission(
              PERMISSION_CODES.PROVIDER_BRANCHES_READ,
              <BranchesPage />
            ),
          },

          // Add Provider
          {
            path: "providers/new",
            element: withPermission(
              PERMISSION_CODES.PROVIDERS_CREATE,
              <ProviderDetailsPage />
            ),
          },

          // Edit / View Provider
          {
            path: "providers/:id",
            element: withPermission(
              PERMISSION_CODES.PROVIDERS_READ,
              <ProviderDetailsPage />
            ),
          },

          {
            path: "clients",
            element: withPermission(
              PERMISSION_CODES.CLIENTS_READ,
              <ClientsPage title="Clients" />
            ),
          },
          //  { path: "invoice-preview", element: <InvoiceDetailsPreviewPage /> }, // TEMP - remove after review
          // View Client Details
          {
            path: "clients/:clientId",
            element: withPermission(
              PERMISSION_CODES.CLIENTS_READ,
              <ClientDetailsPage />
            ),
          },

          {
            path: "provider-map",
            element: withPermission(PERMISSION_CODES.MAP_READ, <ProviderMapPage />),
          },
          {
            path: "/provider-category",
            element: withPermission(
              PERMISSION_CODES.PROVIDER_CATEGORIES_READ,
              <CategoriesPage />
            ),
          },
          {
            path: "/service-category",
            element: withPermission(
              PERMISSION_CODES.SERVICE_CATEGORIES_READ,
              <ServiceCategoriesPage />
            ),
          },
          {
            path: "terms-and-conditions",
            element: withPermission(
              PERMISSION_CODES.TERMS_AND_CONDITIONS_READ,
              <TermsAndConditionsPage />
            ),
          },
          {
            path: "refund-policy",
            element: withPermission(
              PERMISSION_CODES.REFUND_POLICY_READ,
              <RefundPolicyPage />
            ),
          },
          {
            path: "privacy-policy",
            element: withPermission(
              PERMISSION_CODES.PRIVACY_POLICY_READ,
              <PrivacyPolicyPage />
            ),
          },
          {
            path: "contact-us",
            element: withPermission(
              PERMISSION_CODES.CONTACT_US_READ,
              <ContactUsPage />
            ),
          },
          {
            path: "invoices",
            element: withPermission(PERMISSION_CODES.INVOICES_READ, <InvoicesPage />),
          },
          {
            path: "services",
            element: withPermission(
              PERMISSION_CODES.SERVICES_READ,
              <ServicesPage title="Services" />
            ),
          },
          {
            path: "medicines",
            element: withPermission(
              PERMISSION_CODES.MEDICINES_READ,
              <MedicinesPage title="Medicine" />
            ),
          },
          {
            path: "card-activation",
            element: withPermission(PERMISSION_CODES.CARDS_READ, <CardActivationPage />),
          },
          {
            path: "governorates",
            element: withPermission(
              PERMISSION_CODES.GOVERNORATES_READ,
              <GovernoratesPage />
            ),
          },
          {
            path: "cities",
            element: withPermission(PERMISSION_CODES.CITIES_READ, <CitiesPage />),
          },
          // { path: "card-pools", element: <PagePlaceholder title="Card Pools" /> },
          {
            path: "speialist",
            element: withPermission(
              PERMISSION_CODES.SPECIALISTS_READ,
              <SpecialistsPage />
            ),
          },
          {
            path: "support-tickets",
            element: withPermission(PERMISSION_CODES.TICKETS_READ, <TicketsPage />),
          },
          // { path: "activity", element: <PagePlaceholder title="Activity" /> },
          {
            path: "offer-sliders",
            element: withPermission(
              PERMISSION_CODES.SLIDERS_READ,
              <SlidersPage title="Sliders" />
            ),
          },
          {
            path: "card-pools",
            element: withPermission(PERMISSION_CODES.CARD_POOLS_READ, <CardPoolPage />),
          },
          {
            path: "/card-pool/sold-cards",
            element: withPermission(
              PERMISSION_CODES.CARD_SALES_READ,
              <SoldCardsByPoolPage />
            ),
          },
          {
            path: "sold-card",
            element: withPermission(PERMISSION_CODES.CARD_SALES_READ, <CardSoldPage />),
          },
          {
            path: "card-missed",
            element: withPermission(
              PERMISSION_CODES.MISSED_CARDS_READ,
              <CardMissedPage />
            ),
          },
          {
            path: "ticket-types",
            element: withPermission(
              PERMISSION_CODES.TICKET_TYPES_READ,
              <TicketTypesPage />
            ),
          },
          {
            path: "employees",
            element: withPermission(PERMISSION_CODES.EMPLOYEES_READ, <EmployeesPage />),
          },
          // View / Update Slider details (full-size images + edit)
          {
            path: "offer-sliders/:id",
            element: withPermission(
              PERMISSION_CODES.SLIDERS_READ,
              <SliderDetailsPage />
            ),
          },

          {
            path: "plan-types",
            element: withPermission(
              PERMISSION_CODES.PLAN_TYPES_READ,
              <SubscriptionTypesPage />
            ),
          },
          // { path: "offer-sliders", element: <SlidersPage title="Plan Types" /> },
          // { path: "offers", element: <PagePlaceholder title="Offers" /> },

          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
