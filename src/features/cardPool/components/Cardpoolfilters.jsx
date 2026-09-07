import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterPanel from "../../../shared/components/FilterPanel";

export default function CardPoolFilters({ draft, onChange, onApply, onClear, onClose, panelRef }) {
  const setField = (field, value) => onChange({ ...draft, [field]: value });

  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} className="sm:w-72">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">Filters</h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">From Date</label>
          <input
            type="date"
            value={draft.fromDate || ""}
            onChange={(e) => setField("fromDate", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">To Date</label>
          <input
            type="date"
            value={draft.toDate || ""}
            min={draft.fromDate || undefined}
            onChange={(e) => setField("toDate", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onApply}
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Apply
        </button>
      </div>
    </FilterPanel>
  );
}