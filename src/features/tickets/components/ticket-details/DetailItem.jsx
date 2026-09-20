export default function DetailItem({ icon: Icon, label, value, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-100">
        {Icon && <Icon size={15} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="mt-0.5 min-w-0 text-sm font-semibold text-slate-800">
          {children || <span className="block truncate">{value || "-"}</span>}
        </div>
      </div>
    </div>
  );
}
