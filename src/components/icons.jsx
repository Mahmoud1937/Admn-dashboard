// Lightweight inline SVG icons (stroke-based, 24x24) so we don't need an extra
// icon package. Swap for @fortawesome icons later if you'd rather use those.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
};

export const DashboardIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const ProvidersIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M16 4.5c1.5.4 2.5 1.7 2.5 3.2S17.5 10.5 16 10.9" />
    <path d="M21 20c0-2.6-1.7-4.8-4-5.6" />
  </svg>
);

export const ClientsIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M4.5 20c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
    <path d="M9 12.5 11 14.5 15.5 10" />
  </svg>
);

export const MapIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
    <path d="M9 4v13" />
    <path d="M15 6.5v13" />
  </svg>
);

export const CategoriesIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <path d="M17 13v8M13 17h8" />
  </svg>
);

export const ServicesIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 20s-7-4.4-9.3-9C1.2 7.8 3 4.5 6.3 4.2 8.3 4 10.4 5 12 7c1.6-2 3.7-3 5.7-2.8 3.3.3 5.1 3.6 3.6 6.8C19 15.6 12 20 12 20Z" />
  </svg>
);

export const CardActivationIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="M2.5 9.5h19" />
    <path d="M6 15h4" />
  </svg>
);

export const GovernoratesIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 21V8l6-4 6 4v13" />
    <path d="M4 21h16" />
    <path d="M10 21v-6h4v6" />
    <path d="M8 11h.01M12 11h.01M8 15h.01" />
  </svg>
);

export const CitiesIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 21s6-5.7 6-10.8A6 6 0 0 0 6 10.2C6 15.3 12 21 12 21Z" />
    <circle cx="12" cy="10.2" r="2.2" />
  </svg>
);

export const CardPoolsIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m12 3 8 4-8 4-8-4 8-4Z" />
    <path d="m4 11 8 4 8-4" />
    <path d="m4 15 8 4 8-4" />
  </svg>
);

export const SupportTicketsIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1v-7h3" />
    <path d="M4 17v-5h3v7H6a2 2 0 0 1-2-2Z" />
  </svg>
);

export const ActivityIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 12h4l2 7 4-14 2 7h6" />
  </svg>
);

export const SlidersIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 6h10M18 6h2M4 12h2M8 12h12M4 18h14M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

export const PlanTypesIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 3v2h6V3" />
    <path d="M8 11h8M8 15h5" />
  </svg>
);

export const OffersIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="8" width="18" height="13" rx="1.5" />
    <path d="M3 12h18" />
    <path d="M12 8v13" />
    <path d="M12 8c-1.5 0-3.5-.8-3.5-2.5S9.7 3 11 3.5 12 6 12 8Z" />
    <path d="M12 8c1.5 0 3.5-.8 3.5-2.5S14.3 3 13 3.5 12 6 12 8Z" />
  </svg>
);

export const ChevronDownIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const CloseIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
