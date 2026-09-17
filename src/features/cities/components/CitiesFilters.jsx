import GovernorateSelect from "./GovernorateSelect";

export default function CitiesFilters({
  governorateFilter,
  onGovernorateFilterChange,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
      <GovernorateSelect
        value={governorateFilter}
        onChange={onGovernorateFilterChange}
        placeholder="All Governorates"
        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white sm:w-56"
      />
    </div>
  );
}
