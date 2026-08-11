import { NavLink } from 'react-router-dom';
import {
  DashboardIcon,
  ProvidersIcon,
  ClientsIcon,
  MapIcon,
  CategoriesIcon,
  ServicesIcon,
  CardActivationIcon,
  GovernoratesIcon,
  CitiesIcon,
  CardPoolsIcon,
  SupportTicketsIcon,
  ActivityIcon,
  SlidersIcon,
  PlanTypesIcon,
  OffersIcon,
} from './icons';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/providers', label: 'Providers', icon: ProvidersIcon },
  { to: '/clients', label: 'Clients', icon: ClientsIcon },
  { to: '/provider-map', label: 'Provider Map', icon: MapIcon },
  { to: '/categories', label: 'Categories', icon: CategoriesIcon },
  { to: '/services', label: 'Services', icon: ServicesIcon },
  { to: '/card-activation', label: 'Card Activation', icon: CardActivationIcon },
  { to: '/governorates', label: 'Governorates', icon: GovernoratesIcon },
  { to: '/cities', label: 'Cities', icon: CitiesIcon },
  { to: '/card-pools', label: 'Card Pools', icon: CardPoolsIcon },
  { to: '/support-tickets', label: 'Support Tickets', icon: SupportTicketsIcon },
  { to: '/activity', label: 'Activity', icon: ActivityIcon },
  { to: '/sliders', label: 'Sliders', icon: SlidersIcon },
  { to: '/plan-types', label: 'Plan Types', icon: PlanTypesIcon },
  { to: '/offers', label: 'Offers', icon: OffersIcon },
];

const Sidebar = () => {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          M
        </div>
        <div>
          <p className="text-lg font-semibold leading-tight text-slate-900">Medicard</p>
          <p className="text-[11px] leading-tight text-slate-400">Powered by Khusm</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
