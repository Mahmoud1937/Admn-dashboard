import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import useLanguage from '../localization/useLanguage';

// Matches the `lg:hidden` breakpoint used for the Navbar's hamburger button.
const MOBILE_QUERY = "(max-width: 1023px)";

const Layout = () => {
  const { direction } = useLanguage();
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false
  );

  // Auto-collapse to icon-only whenever the viewport crosses into mobile/tablet size.
  // Manual toggling (sidebar header button or navbar hamburger) still works after that.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handleChange = (e) => setCollapsed(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <div dir="ltr" className={`flex h-screen bg-slate-50 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onToggleSidebar={() => setCollapsed((prev) => !prev)} />
        <main dir={direction} className="flex-1 overflow-y-auto p-4 md:p-8">
          <div dir={direction} className="contents">
            <Outlet
              context={{
                sidebarCollapsed: collapsed,
                setSidebarCollapsed: setCollapsed,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
