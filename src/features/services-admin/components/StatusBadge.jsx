export default function StatusBadge({ isActive }) {
  if (isActive === null || isActive === undefined) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}