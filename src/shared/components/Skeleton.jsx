// Callers keep their existing sizes, colors, and layout; this adds no wrapper.
export default function Skeleton({ as: Element = "div", className = "", ...props }) {
  return <Element {...props} className={`animate-pulse ${className}`.trim()} />;
}

export function SkeletonTable({
  rows = 6,
  columns = 5,
  rowClassName = "flex items-center gap-4 px-6 py-4",
  header,
  label,
  children,
}) {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" role={label ? "status" : undefined}>
      {label && <span className="sr-only">{label}</span>}
      {header}
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={rowClassName}>
          {children ?? Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} aria-hidden="true" className="h-4 min-w-0 flex-1 rounded bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 4, label, className = "w-full space-y-4 p-6" }) {
  return (
    <div className={className} aria-busy="true" role={label ? "status" : undefined}>
      {label && <span className="sr-only">{label}</span>}
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} aria-hidden="true" className="h-4 w-full rounded bg-slate-100 last:w-2/3" />
      ))}
    </div>
  );
}
