import { ArrowRight, KeyRound, LockKeyhole, LogOut, RefreshCw, ShieldCheck, ShieldX } from "lucide-react";
import Logo from "../../assets/logo.png";
import { useAuth } from "../../features/auth/context/Authcontext";
import useAuthMutations from "../../features/auth/hooks/useAuthMutations";

function NoPageAccessState() {
  const { user, refreshPermissions, isPermissionsInitializing } = useAuth();
  const { logout, isLoggingOut } = useAuthMutations();
  const isBusy = isPermissionsInitializing || isLoggingOut;

  return (
    <main aria-labelledby="no-page-access-title" className="relative flex min-h-dvh flex-col overflow-hidden bg-[#f4f7fb] px-4 py-6 sm:px-8 sm:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#e7eef7] to-transparent" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <header className="mb-8 flex items-center justify-between gap-4">
          <img src={Logo} alt="MediCard" className="h-12 w-auto max-w-[190px] object-contain sm:h-14" />
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <ShieldCheck size={16} className="text-[#2caba2]" aria-hidden="true" />
            Secure workspace
          </span>
        </header>

        <section className="my-auto grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-[#1b4477]/5 md:grid-cols-[0.8fr_1.2fr]">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-[#1b4477] p-7 text-white sm:p-10 md:flex">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full border border-white/10" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full border border-white/10" />
            <span className="relative inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-[#61d5ca]" aria-hidden="true" />
              Account signed in
            </span>

            <div className="relative my-8 flex items-center gap-5 md:my-12 md:flex-col md:items-start md:gap-8">
              <div aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/10 shadow-lg shadow-blue-950/10 md:h-28 md:w-28">
                <LockKeyhole className="h-9 w-9 text-[#8be3da] md:h-12 md:w-12" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8be3da]">Workspace access</p>
                <h2 className="mt-2 text-xl font-semibold leading-snug sm:text-2xl">The right access.<br />For your role.</h2>
              </div>
            </div>

            <p className="relative max-w-xs text-xs leading-6 text-blue-100/80">Your administrator manages which areas of MediCard are available to your account.</p>
          </div>

          <div className="min-w-0 p-7 sm:p-10 lg:p-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200/70">
              <KeyRound size={13} aria-hidden="true" />
              Permissions required
            </span>
            <h1 id="no-page-access-title" className="mt-5 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">No pages available yet</h1>
            <p className="mt-4 text-sm leading-7 text-slate-500">You are signed in, but your account does not currently have access to any dashboard pages.</p>

            {user?.email && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Signed in as</p>
                <p className="mt-1 break-all text-sm font-medium text-slate-700">{user.email}</p>
              </div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#2caba2]/20 bg-[#f2faf9] p-4">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#228d86]" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Ask your administrator for access</h2>
                <p className="mt-1 text-xs leading-6 text-slate-500">Let them know which pages you need. Once permissions are assigned, select Check access to continue.</p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => refreshPermissions().catch(() => {})}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b4477] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14365f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b4477] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={16} className={isPermissionsInitializing ? "animate-spin" : ""} aria-hidden="true" />
                {isPermissionsInitializing ? "Checking access..." : "Check access"}
                <ArrowRight size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={logout}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b4477] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={16} aria-hidden="true" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-400">Using a different account? Log out to sign in again.</p>
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-slate-400">MediCard Administration <span aria-hidden="true" className="mx-2">&middot;</span> Managed access</footer>
      </div>
    </main>
  );
}

export default function AccessDeniedPage({ noPageAccess = false }) {
  const year = new Date().getFullYear();

  if (noPageAccess) return <NoPageAccessState />;

  return (
    <section className="flex min-h-[520px] flex-col bg-white px-5 py-10 sm:px-8">
      <div className="flex flex-1 items-center justify-center">
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
        </div>
      </div>

      <footer className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
        © {year} All rights reserved by{" "}
        <span className="font-semibold text-slate-500">Khusm</span>
      </footer>
    </section>
  );
}
