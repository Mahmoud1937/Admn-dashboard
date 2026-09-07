import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { PLATFORM_TYPE } from "../hooks/useClientsQuery";
import FilterPanel from "../../../shared/components/FilterPanel";


export default function ClientsFiltersPanel({ draft, onChange, onApply, onClear, onClose, panelRef }) {
  const set = (field) => (e) =>
    onChange((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} className="sm:w-80">
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
            Platform
          </label>
          <select
            value={draft.platformType}
            onChange={set("platformType")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value="">All platforms</option>
            <option value={PLATFORM_TYPE .ANDROID}>Android</option>
            <option value={PLATFORM_TYPE.IOS}>iOS</option>
            <option value={PLATFORM_TYPE.WEB}>Web</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Gender
          </label>
          <select
            value={draft.isMale}
            onChange={set("isMale")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value="">All genders</option>
            <option value="true">Male</option>
            <option value="false">Female</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Card
          </label>
          <select
            value={draft.hasCard}
            onChange={set("hasCard")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value="">All</option>
            <option value="true">Has card</option>
            <option value="false">No card</option>
          </select>
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
    </FilterPanel>
  );
}
