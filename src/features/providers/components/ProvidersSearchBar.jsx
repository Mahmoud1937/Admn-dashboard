import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";

export default function ProvidersSearchBar({
  value,
  onChange,
  onFilterClick,
  activeFilterCount = 0,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name (EN/AR) or ID..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white sm:placeholder:content-[attr(placeholder)]"
        />
      </div>

      <button
        onClick={onFilterClick}
        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <FontAwesomeIcon icon={faFilter} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}