import { KeyRound, ShieldX } from "lucide-react";
import Logo from "../../assets/logo.png";

export default function AccessDeniedPage() {
  const year = new Date().getFullYear();

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
