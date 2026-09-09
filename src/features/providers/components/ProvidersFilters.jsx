import ProviderCategorySelect from "./ProviderCategorySelect";
import SpecialistSelect from "../../services-admin/components/SpecialistSelect";
import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";


export const emptyFilters = {
  status: 0,
  joinDateFrom: "",
  joinDateTo: "",
  categoryId: "",
  specialistId: "",
};

export default function ProvidersFilters({ draft, onChange, onApply, onClear, onClose, panelRef }) {
  const set = (field) => (e) =>
    onChange((prev) => ({ ...prev, [field]: e.target.value }));

  // SpecialistSelect is a controlled component: onChange receives the raw
  // value directly (not an input change event).
  const setValue = (field) => (val) =>
    onChange((prev) => ({ ...prev, [field]: val }));

  const setStatus = (e) =>
    onChange((prev) => ({ ...prev, status: Number(e.target.value) }));

  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} className="sm:w-80">
      <FilterPanelHeader onClose={onClose} />

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Status
          </label>
          <select
            value={draft.status}
            onChange={setStatus}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value={0}>All</option>
            <option value={1}>Active</option>
            <option value={2}>Inactive</option>
          </select>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Join Date From
            </label>
            <input
              type="date"
              value={draft.joinDateFrom}
              onChange={set("joinDateFrom")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Join Date To
            </label>
            <input
              type="date"
              value={draft.joinDateTo}
              onChange={set("joinDateTo")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Category
          </label>
          <ProviderCategorySelect
            value={draft.categoryId}
            onChange={setValue("categoryId")}
            placeholder="All categories"
          />
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Specialist
          </label>
          <SpecialistSelect
            value={draft.specialistId}
            onChange={setValue("specialistId")}
            placeholder="All specialists"
          />
        </div>

        <FilterPanelFooter onClear={onClear} onApply={onApply} />
    </FilterPanel>
  );
}