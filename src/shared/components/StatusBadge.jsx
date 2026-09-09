const TONES = {
  success: "bg-green-50 text-green-700",
  danger: "bg-red-50 text-red-700",
  inactive: "bg-slate-100 text-slate-500",
  neutral: "bg-slate-100 text-slate-600",
  emerald: "bg-emerald-50 text-emerald-600",
  primary: "bg-blue-50 text-blue-700",
  warning: "bg-amber-50 text-amber-700",
};

export default function StatusBadge({
  tone = "neutral",
  size = "md",
  children,
  className = "",
}) {
  const sizeClass =
    size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${TONES[tone] || TONES.neutral} ${className}`}
    >
      {children}
    </span>
  );
}