import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import GovernorateSelect from "./GovernorateSelect";

export default function CitiesFilters({
  search,
  onSearchChange,
  governorateFilter,
  onGovernorateFilterChange,
  statusFilter,
  onStatusFilterChange,
  governorates,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
      <div className="relative flex-1">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search cities by name (EN/AR)..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
        />
      </div>

      <GovernorateSelect
        governorates={governorates}
        value={governorateFilter}
        onChange={(e) => onGovernorateFilterChange(e.target.value)}
        placeholder="All Governorates"
        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white sm:w-56"
      />
    </div>
  );
}