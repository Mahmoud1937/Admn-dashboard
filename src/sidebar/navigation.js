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
} from "@fortawesome/free-solid-svg-icons";

export const navigation = [
  {
    title: "Providers",
    path: "/providers",
    icon: faHospital,
    children: [
      {
        title: "Provider Category",
        path: "/provider-category",
        icon: faLayerGroup,
      },
      {
        title: "Provider Map",
        path: "/provider-map",
        icon: faMapLocationDot,
      },
    ],
  },

  {
    title: "Service Category",
    path: "/service-category",
    icon: faLayerGroup,
    children: [
      {
        title: "Services",
        path: "/services",
        icon: faStethoscope,
      },
    ],
  },

  {
    title: "Clients",
    path: "/clients",
    icon: faUsers,
  },

  {
    title: "Medicines",
    path: "/medicines",
    icon: faPills,
  },

  {
    title: "Card Activation",
    path: "/card-activation",
    icon: faCreditCard,
  },

  {
    title: "Offers Sliders",
    path: "/offer-sliders",
    icon: faImages,
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
    icon: faUserDoctor,
  },
  {
    title: "Card Pools",
    path: "/card-pools",
    icon: faIdCard,
  },
  {
    title: "Terms & Conditions",
    path: "/terms-and-conditions",
    icon: faFileContract,
  },

  {
    title: "Refund Policy",
    path: "/refund-policy",
    icon: faUndo,
  },

  {
    title: "Privacy Policy",
    path: "/privacy-policy",
    icon: faShieldHalved,
  },

  {
    title: "Contact Us",
    path: "/contact-us",
    icon: faAddressBook,
  },
];