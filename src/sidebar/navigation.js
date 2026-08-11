import {
  faGaugeHigh,
  faHospital,
  faUsers,
  faMapLocationDot,
  faLayerGroup,
  faStethoscope,
  faCreditCard,
  faMap,
  faCity,

  faHeadset,
  faChartLine,
  faImages,
  faClipboardList,
  faClinicMedical,
} from "@fortawesome/free-solid-svg-icons";

export const navigation = [
  {
    title: "Dashboard",
    path: "/",
    icon: faGaugeHigh,
  },
  {
    title: "Providers",
    path: "/providers",
    icon: faHospital,
  },
  {
    title: "Clients",
    path: "/clients",
    icon: faUsers,
  },
  {
    title: "Provider Map",
    path: "/provider-map",
    icon: faMapLocationDot,
  },
  {
    title: "Provider Category",
    path: "/provider-category",
    icon: faLayerGroup,
  },
  {
    title: "Service Category",
    path: "/service-category",
    icon: faLayerGroup,
  },
  {
    title: "Services",
    path: "/services",
    icon: faStethoscope,
  },
  {
    title: "Medicines",
    path: "/medicines",
    icon: faStethoscope,
  },
  {
    title: "Card Activation",
    path: "/card-activation",
    icon: faCreditCard,
  },
  {
    title: "Governorates",
    path: "/governorates",
    icon: faMap,
  },
  {
    title: "Cities",
    path: "/cities",
    icon: faCity,
  },
  {
    title: "Specialist",
    path: "/speialist",
    icon: faClinicMedical,
  },
  {
    title: "Support Tickets",
    path: "/support-tickets",
    icon: faHeadset,
  },
  {
    title: "Activity",
    path: "/activity",
    icon: faChartLine,
  },
  {
    title: "Sliders",
    path: "/sliders",
    icon: faImages,
  },
  {
    title: "Plan Types",
    path: "/plan-types",
    icon: faClipboardList,
  }
];