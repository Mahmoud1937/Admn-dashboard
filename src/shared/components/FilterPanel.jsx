import { useTranslation } from "react-i18next";

export default function FilterPanel({
  panelRef,
  onClose,
  className = "",
  side,
  children,
}) {
  const { i18n } = useTranslation("common");
  side ??= i18n.dir() === "rtl" ? "left" : "right";
  return (
    <>
      {/* Mobile-only backdrop, closes the panel on outside tap */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 cursor-pointer bg-slate-900/30 sm:hidden"
      />

      <div
        ref={panelRef}
        className={`absolute ${side === "left" ? "left-4" : "right-4"} top-full z-[60] mt-2 box-border w-[min(15rem,calc(100%-2rem))] min-w-0 overflow-visible rounded-xl border border-slate-200 bg-white p-5 shadow-lg sm:z-20 ${className}`}
      >
        {children}
      </div>
    </>
  );
}
