import { useState } from 'react';
import { ChevronDownIcon } from './icons';

const Navbar = ({ onOpenMobileSidebar }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 md:hidden"
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      <div className="hidden md:block" />

      {/* Admin user */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
        >
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            A
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-900">Admin User</p>
            <p className="text-xs leading-tight text-slate-400">Super Admin</p>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <button className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50">
              Profile
            </button>
            <button className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50">
              Settings
            </button>
            <button className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
