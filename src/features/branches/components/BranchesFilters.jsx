import GovernorateSelect from "../../cities/components/GovernorateSelect";
import CitySelect from "./CitySelect";
import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";

export default function BranchesFilters({
  draft,
  onChange,
  onApply,
  onClear,
  onClose,
  panelRef,
}) {
  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} className="sm:w-80">
      <FilterPanelHeader onClose={onClose} />

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Governorate
        </label>
        <GovernorateSelect
          value={draft.governorateId}
          onChange={(value) => onChange((previous) => ({
            ...previous,
            governorateId: value ?? "",
            cityId: "",
          }))}
          placeholder="All Governorates"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          City
        </label>
        <CitySelect
          governorateId={draft.governorateId}
          value={draft.cityId}
          onChange={(value) => onChange((previous) => ({ ...previous, cityId: value ?? "" }))}
          placeholder="All Cities"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="branch-status-filter" className="mb-1.5 block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="branch-status-filter"
          value={draft.status}
          onChange={(event) => onChange((previous) => ({ ...previous, status: event.target.value }))}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          <option value="">All Statuses</option>
          <option value="1">Active</option>
          <option value="2">Inactive</option>
        </select>
      </div>

      <FilterPanelFooter onClear={onClear} onApply={onApply} />
    </FilterPanel>
  );
}
