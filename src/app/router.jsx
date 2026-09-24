/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "../shared/components/Protectedroute";

const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const NotFoundPage = lazy(() => import("../shared/components/NotFoundPage"));
const ProvidersPage = lazy(() => import("../features/providers/pages/ProvidersPage"));
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
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
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
          { index: true, element: <DashboardPage /> },

          { path: "providers", element: <ProvidersPage /> },

          // Add Provider
          { path: "providers/new", element: <ProviderDetailsPage /> },

          // Edit / View Provider
          { path: "providers/:id", element: <ProviderDetailsPage /> },

          { path: "clients", element: <ClientsPage title="Clients" /> },
          //  { path: "invoice-preview", element: <InvoiceDetailsPreviewPage /> }, // TEMP - remove after review
          // View Client Details
          { path: "clients/:clientId", element: <ClientDetailsPage /> },

          { path: "provider-map", element: <ProviderMapPage /> },
          { path: "/provider-category", element: <CategoriesPage /> },
          { path: "/service-category", element: <ServiceCategoriesPage /> },
          {
            path: "terms-and-conditions",
            element: <TermsAndConditionsPage />,
          },
          {
            path: "refund-policy",
            element: <RefundPolicyPage />,
          },
          {
            path: "privacy-policy",
            element: <PrivacyPolicyPage />,
          },
          {
            path: "contact-us",
            element: <ContactUsPage />,
          },
          { path: "invoices", element: <InvoicesPage /> },
          { path: "services", element: <ServicesPage title="Services" /> },
          { path: "medicines", element: <MedicinesPage title="Medicine" /> },
          { path: "card-activation", element: <CardActivationPage /> },
          { path: "governorates", element: <GovernoratesPage /> },
          { path: "cities", element: <CitiesPage /> },
          // { path: "card-pools", element: <PagePlaceholder title="Card Pools" /> },
          { path: "speialist", element: <SpecialistsPage /> },
          { path: "support-tickets", element: <TicketsPage /> },
          // { path: "activity", element: <PagePlaceholder title="Activity" /> },
          { path: "offer-sliders", element: <SlidersPage title="Sliders" /> },
          { path: "card-pools", element: <CardPoolPage /> },
          { path: "/card-pool/sold-cards", element: <SoldCardsByPoolPage /> },
          { path: "sold-card", element: <CardSoldPage /> },
          { path: "card-missed", element: <CardMissedPage /> },
          { path: "ticket-types", element: <TicketTypesPage /> },
          // View / Update Slider details (full-size images + edit)
          { path: "offer-sliders/:id", element: <SliderDetailsPage /> },

          { path: "plan-types", element: <SubscriptionTypesPage /> },
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
