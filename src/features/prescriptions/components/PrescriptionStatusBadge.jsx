import usePrescriptionsText from "../../../localization/usePrescriptionsText";

const statusStyles = {
  Pending: { badge: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  Processed: { badge: "border-emerald-200 bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  Rejected: { badge: "border-rose-200 bg-rose-50 text-rose-800", dot: "bg-rose-500" },
};
const fallbackStyle = { badge: "border-slate-200 bg-slate-50 text-slate-600", dot: "bg-slate-400" };

export default function PrescriptionStatusBadge({ status }) {
  const t = usePrescriptionsText();
  const style = statusStyles[status] || fallbackStyle;
  const label = status || t("Unknown");

  return (
    <span title={label} className={`inline-flex h-7 w-24 items-center justify-start gap-1.5 whitespace-nowrap rounded-md border px-2 text-start text-xs font-medium leading-none ${style.badge}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      <span className="truncate">{label}</span>
    </span>
  );
}
