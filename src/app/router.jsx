import { createBrowserRouter } from "react-router-dom";

import DashboardLayout from "../layout/DashboardLayout";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import PagePlaceholder from "../shared/components/PagePlaceholder";
import ProvidersPage from "../features/providers/pages/ProvidersPage";
import ProviderDetailsPage from "../features/providers/pages/ProviderDetailsPage";
import GovernoratesPage from "../features/governorates/pages/GovernoratesPage";
import CategoriesPage from "../features/categoreis/pages/CategoryPage";
import CitiesPage from "../features/cities/pages/cityPages";
import SpecialistsPage from "../features/specialists/pages/SpecialistsPage";
import ServiceCategoriesPage from "../features/ServiceCategory/pages/ServiceCategoriesPage";

import MedicinesPage from "../features/Medicines/pages/Medicinespage";
import ServicesPage from "../features/services-admin/pages/ServicesPage";
import ProviderMapPage from "../features/provider-map/pages/ProviderMapPage";
import SlidersPage from "../features/offer-sliders/pages/SlidersPage";
import SliderDetailsPage from "../features/offer-sliders/pages/SliderDetailsPage";
import TermsAndConditionsPage from "../features/termsAndConditions/pages/TermsAndConditionsPage";
import RefundPolicyPage from "../features/refundPolicy/pages/RefundPolicyPage";
import PrivacyPolicyPage from "../features/privacyPolicy/pages/PrivacyPolicyPage";
import ContactUsPage from "../features/contactUs/pages/ContactUsPage";




const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },

      { path: "providers", element: <ProvidersPage /> },

      // Add Provider
      { path: "providers/new", element: <ProviderDetailsPage /> },

      // Edit / View Provider
      { path: "providers/:id", element: <ProviderDetailsPage /> },

      { path: "clients", element: <PagePlaceholder title="Clients" /> },
      { path: "provider-map", element: <ProviderMapPage /> },
      { path: "/provider-category", element: <CategoriesPage /> },
      { path: "/service-category", element: <ServiceCategoriesPage /> },
            {
        path: "terms-and-conditions",
        element: <TermsAndConditionsPage/>,
      },
      {
        path: "refund-policy",
        element: <RefundPolicyPage/>,
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicyPage/>,
      },
      {
        path: "contact-us",
        element: <ContactUsPage/>,
      },
      { path: "services", element: <ServicesPage title="Services" /> },
      { path: "medicines", element: <MedicinesPage title="Medicine" /> },
      { path: "card-activation", element: <PagePlaceholder title="Card Activation" /> },
      { path: "governorates", element: <GovernoratesPage /> },
      { path: "cities", element: <CitiesPage/> },
      { path: "card-pools", element: <PagePlaceholder title="Card Pools" /> },
      { path: "speialist", element: <SpecialistsPage /> },
      { path: "support-tickets", element: <PagePlaceholder title="Support Tickets" /> },
      { path: "activity", element: <PagePlaceholder title="Activity" /> },
      { path: "offer-sliders", element: <SlidersPage title="Sliders" /> },

      // View / Update Slider details (full-size images + edit)
      { path: "offer-sliders/:id", element: <SliderDetailsPage /> },

      { path: "plan-types", element: <PagePlaceholder title="Plan Types" /> },
      // { path: "offer-sliders", element: <SlidersPage title="Plan Types" /> },
      { path: "offers", element: <PagePlaceholder title="Offers" /> },

      {
        path: "*",
        element: (
          <PagePlaceholder
            title="404"
            description="Page Not Found"
          />
        ),
      },
    ],
  },
]);

export default router;