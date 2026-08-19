import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import ProviderCategorySelect from "./ProviderCategorySelect";
import SpecialistSelect from "../../services-admin/components/SpecialistSelect";


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
    <>
      {/* Mobile-only backdrop, closes the panel on outside tap */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-20 bg-slate-900/30 sm:hidden"
      />

      <div
        ref={panelRef}
        className="
          fixed inset-x-0 bottom-0 z-30 max-h-[85vh] w-full overflow-y-auto
          rounded-t-2xl border border-slate-200 bg-white p-5 shadow-lg
          sm:absolute sm:inset-x-auto sm:right-4 sm:top-full sm:bottom-auto
          sm:z-20 sm:mt-2 sm:max-h-none sm:w-80 sm:rounded-xl sm:bg-white/95
          sm:backdrop-blur-sm
        "
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

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

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={onClear}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Clear all
          </button>
          <button
            onClick={onApply}
            className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}