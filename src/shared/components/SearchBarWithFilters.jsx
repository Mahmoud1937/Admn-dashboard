import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";

export default function SearchBarWithFilters({
  value,
  onChange,
  placeholder,
  onFilterClick,
  activeFilterCount = 0,
  filterButtonRef,
  stacked = true,
  alignEnd = false,
}) {
  return (
    <div
      className={`flex items-center gap-3 border-b border-slate-200 p-4 ${
        stacked ? "flex-col sm:flex-row sm:items-center" : ""
      } ${alignEnd ? "justify-end" : ""}`}
    >
      {value !== undefined && (
        <div className="relative min-w-0 flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
          />
        </div>
      )}

      <button
        ref={filterButtonRef}
        type="button"
        onClick={onFilterClick}
        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <FontAwesomeIcon icon={faFilter} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}