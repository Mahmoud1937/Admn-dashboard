import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowRight, KeyRound, PanelLeft, ShieldX } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { useMemo } from "react";
import Logo from "../../assets/Logo.svg";
import { useAuth } from "../../features/auth/context/Authcontext";
import { getVisibleNavigation } from "../../sidebar/navigation";

const MAX_SUGGESTED = 6;

export default function AccessDeniedPage() {
  const { hasPermission } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useOutletContext() ?? {};

  const visibleNavigation = useMemo(
    () => getVisibleNavigation(hasPermission),
    [hasPermission]
  );

  const authorizedPages = useMemo(() => {
    const seen = new Set();
    return visibleNavigation
      .flatMap((item) => [
        ...(item.canAccessParent ? [item] : []),
        ...(item.children ?? []),
      ])
      .filter((page) => {
        if (!page.path || seen.has(page.path)) return false;
        seen.add(page.path);
        return true;
      });
  }, [visibleNavigation]);

  const suggestedPages = authorizedPages.slice(0, MAX_SUGGESTED);
  const hasMore = authorizedPages.length > suggestedPages.length;
  const canExpandSidebar =
    typeof setSidebarCollapsed === "function" && sidebarCollapsed;

  return (
    <section className="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-10 shadow-sm sm:px-8">
      <div className="w-full max-w-xl text-center">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img
            src={Logo}
            alt="MediCard"
            className="h-20 w-auto max-w-[260px] object-contain sm:h-24"
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#2caba2]">
            Secure access
          </span>
        </div>

        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary-50 ring-8 ring-[#2caba2]/15" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1b4477] text-white shadow-lg shadow-primary-700/20">
            <ShieldX size={30} strokeWidth={1.8} aria-hidden="true" />
            <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-[#2caba2] text-white shadow-sm">
              <KeyRound size={13} strokeWidth={2.2} aria-hidden="true" />
            </span>
          </div>
        </div>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
          Restricted area
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Access denied
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
          Your account does not have the permission required to view this page.
          You can jump to one of the pages below, or use the sidebar to see
          everything available to you.
        </p>

        <div className="mx-auto mt-8 max-w-md text-left">
          {suggestedPages.length > 0 ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-700">
                  Some of your available pages
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                  Showing {suggestedPages.length} of {authorizedPages.length}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {suggestedPages.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {page.icon && (
                        <FontAwesomeIcon
                          icon={page.icon}
                          className="w-4 shrink-0 text-slate-400 group-hover:text-primary-600"
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">{page.title}</span>
                    </span>
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>

              {/* Sidebar hint */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary-600/15 bg-primary-50 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm ring-1 ring-primary-600/10">
                  <PanelLeft size={18} aria-hidden="true" />
                </span>
                <p className="min-w-0 flex-1 text-sm leading-5 text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {hasMore ? "Looking for something else?" : "Need to go elsewhere?"}
                  </span>{" "}
                  {canExpandSidebar
                    ? "Expand the sidebar to see and choose from all your pages."
                    : "Use the sidebar to see and choose from all your pages."}
                </p>
                {canExpandSidebar && (
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(false)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-primary-700 shadow-sm ring-1 ring-primary-600/20 transition hover:bg-primary-600 hover:text-white"
                  >
                    <PanelLeft size={14} aria-hidden="true" />
                    Open sidebar
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
              There are no other pages available for your account right now.
              Please contact your system administrator for access.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}