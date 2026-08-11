import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function TableEmptyState({ icon, title, hasActiveFilters, emptyMessage }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <FontAwesomeIcon icon={icon} className="text-2xl text-slate-400" />
      </div>
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-400">
        {hasActiveFilters ? "Try a different search term." : emptyMessage}
      </p>
    </div>
  );
}