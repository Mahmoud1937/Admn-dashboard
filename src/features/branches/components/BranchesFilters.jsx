import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import GovernorateSelect from "../../cities/components/GovernorateSelect";
import CitySelect from "./CitySelect";

export default function BranchesFilters({
  search,
  onSearchChange,
  governorateFilter,
  onGovernorateFilterChange,
  cityFilter,
  onCityFilterChange,
  statusFilter,
  onStatusFilterChange,
  children,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search By Name (EN/AR) or email ..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
        />
      </div>

      {/* Governorate */}
      <div className="sm:w-56">
        <GovernorateSelect
          value={governorateFilter}
          onChange={onGovernorateFilterChange}
          placeholder="All Governorates"
        />
      </div>

      {onCityFilterChange && (
        <div className="sm:w-56">
          <CitySelect
            governorateId={governorateFilter}
            value={cityFilter}
            onChange={onCityFilterChange}
            placeholder="All Cities"
            disabled={!governorateFilter}
          />
        </div>
      )}

      {/* Status */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white sm:w-56"
      >
        <option value="">All Statuses</option>
        <option value="1">Active</option>
        <option value="2">Inactive</option>
      </select>
      {children}
    </div>
  );
}
