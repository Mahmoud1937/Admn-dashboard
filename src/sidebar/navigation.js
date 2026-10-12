import {
  faHospital,
  faUsers,
  faMapLocationDot,
  faLayerGroup,
  faStethoscope,
  faPills,
  faCreditCard,
  faMap,
  faCity,
  faImages,
  faUserDoctor,
  faFileContract,
  faUndo,
  faShieldHalved,
  faAddressBook,
  faIdCard,
  faTriangleExclamation,
  faFileInvoiceDollar,
  faTicket,
  faMoneyBillWave,
  faHeadset,
  faUserTie,
  faChartLine,
  faCodeBranch,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { PERMISSION_CODES } from "../features/auth/constants/permissionCodes";

export const navigation = [
  {
    title: "Dashboard",
    path: "/",
    icon: faChartLine,
    permission: PERMISSION_CODES.DASHBOARD_READ,
  },

  {
    title: "Providers",
    path: "/providers",
    icon: faHospital,
    permission: PERMISSION_CODES.PROVIDERS_READ,
    children: [
      {
        title: "Provider Category",
        path: "/provider-category",
        icon: faLayerGroup,
        permission: PERMISSION_CODES.PROVIDER_CATEGORIES_READ,
      },
      {
        title: "Provider Map",
        path: "/provider-map",
        icon: faMapLocationDot,
        permission: PERMISSION_CODES.MAP_READ,
      },
    ],
  },
  {
    title: "Branches",
    path: "/branches",
    icon: faCodeBranch,
    permission: PERMISSION_CODES.PROVIDER_BRANCHES_READ,
  },

  {
    title: "Service Category",
    path: "/service-category",
    icon: faLayerGroup,
    permission: PERMISSION_CODES.SERVICE_CATEGORIES_READ,
    children: [
      {
        title: "Services",
        path: "/services",
        icon: faStethoscope,
        permission: PERMISSION_CODES.SERVICES_READ,
      },
    ],
  },

  {
    title: "Clients",
    path: "/clients",
    icon: faUsers,
    permission: PERMISSION_CODES.CLIENTS_READ,
  },

  {
    title: "Medicines",
    path: "/medicines",
    icon: faPills,
    permission: PERMISSION_CODES.MEDICINES_READ,
  },



  {
    title: "Offers Sliders",
    path: "/offer-sliders",
    icon: faImages,
    permission: PERMISSION_CODES.SLIDERS_READ,
  },

  {
    title: "Governorates",
    path: "/governorates",
    icon: faMap,
    permission: PERMISSION_CODES.GOVERNORATES_READ,
  },

  {
    title: "Cities",
    path: "/cities",
    icon: faCity,
    permission: PERMISSION_CODES.CITIES_READ,
  },

  {
    title: "Specialist",
    path: "/speialist",
    icon: faUserDoctor,
    permission: PERMISSION_CODES.SPECIALISTS_READ,
  },
  {
    title: "Card Pools",
    path: "/card-pools",
    icon: faIdCard,
    permission: PERMISSION_CODES.CARD_POOLS_READ,
  },
  {
    title: "Sold Card",
    path: "/sold-card",
    icon: faCreditCard,
    permission: PERMISSION_CODES.CARD_SALES_READ,
  },
  {
  title: "Missed Cards",
  path: "/card-missed",
  icon: faTriangleExclamation,
  permission: PERMISSION_CODES.MISSED_CARDS_READ,
},
  {
    title: "Invoices",
    path: "/invoices",
    icon: faFileInvoiceDollar,
    permission: PERMISSION_CODES.INVOICES_READ,
  },
  {
    title: "Ticket Types",
    path: "/ticket-types",
    icon: faTicket,
    permission: PERMISSION_CODES.TICKET_TYPES_READ,
  },
  {
    title: "Tickets",
    path: "/support-tickets",
    icon: faHeadset,
    permission: PERMISSION_CODES.TICKETS_READ,
  },
  {
    title: "Employees",
    path: "/employees",
    icon: faUserTie,
    permission: PERMISSION_CODES.EMPLOYEES_READ,
  },
  {
    title: "Subscription Types",
    path: "/plan-types",
    icon: faMoneyBillWave,
    permission: PERMISSION_CODES.PLAN_TYPES_READ,
  },
    {
  title: "Notifications",
  path: "/notifications",
  icon: faBell,
  permission: PERMISSION_CODES.NOTIFICATION_MARKETING_READ,
},
  {
    title: "Terms & Conditions",
    path: "/terms-and-conditions",
    icon: faFileContract,
    permission: PERMISSION_CODES.TERMS_AND_CONDITIONS_READ,
  },

  {
    title: "Refund Policy",
    path: "/refund-policy",
    icon: faUndo,
    permission: PERMISSION_CODES.REFUND_POLICY_READ,
  },

  {
    title: "Privacy Policy",
    path: "/privacy-policy",
    icon: faShieldHalved,
    permission: PERMISSION_CODES.PRIVACY_POLICY_READ,
  },

  {
    title: "Contact Us",
    path: "/contact-us",
    icon: faAddressBook,
    permission: PERMISSION_CODES.CONTACT_US_READ,
  },
];

export const getVisibleNavigation = (hasPermission) =>
  navigation.reduce((items, item) => {
    const visibleChildren = item.children?.filter(
      (child) => !child.permission || hasPermission(child.permission)
    );
    const canAccessParent =
      !item.permission || hasPermission(item.permission);

    if (!canAccessParent && !visibleChildren?.length) return items;

    items.push({
      ...item,
      ...(item.children ? { children: visibleChildren } : {}),
      canAccessParent,
    });
    return items;
  }, []);
